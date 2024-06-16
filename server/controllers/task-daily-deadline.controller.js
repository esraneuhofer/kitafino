require('dotenv').config();
const sgMail = require('@sendgrid/mail');
const {isHoliday} = require("feiertagejs");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const {getWeekNumber} = require("./deadline-deadline.functions");
const {getEmailBodyOrderDayCustomer} = require("./email-order-customer");
const {setOrderStudentBackend, getPriceStudent, getNameMenuDay} = require("./order-functions");
const {getMenusForWeekplan} = require("./weekplan-functions");
const {getIndexDayOrder} = require("./deadline-orderclass.functions");
const mongoose = require("mongoose");
const Settings = mongoose.model('Settings');
const Customer = mongoose.model('Customer');
const PermanentOrderStudent = mongoose.model('PermanentOrderStudent');
const OrderStudent = mongoose.model('OrderStudent');
const Vacation = mongoose.model('Vacation');
const Menu = mongoose.model('Menu');
const Weekplan = mongoose.model('Weekplan');
const StudentNew = mongoose.model('StudentNew');
const TenantParent = mongoose.model('Tenantparent');
const {addOrder} = require('./place-order.controller');
const getInvoiceDateOne = require('./date.functions').getInvoiceDateOne;
const {studentHasNotPlacedOrderYet, getStudentById, getDayDeadlineOrder,isVacation} = require("./permanent-order.functions");
const {sendSuccessEmail, sendCancellationEmail} = require("./email.functions");


function setMockRequest(req) {
  return {
    tenantId: '651c635eca2c3d25809ce4f5',
    customerId: '6540b2117d2b64903bb4e3a2',
    _id: '65589d74e01397281ce02472',
  };
}
//Todo: findWeek and Year according to orderFrist
async function processOrder(customerId,tenantId){
  // let tenantId = '651c635eca2c3d25809ce4f5';
  // let customerId = "6540b2117d2b64903bb4e3a2";
  try {
    const customer = await Customer.findOne({customerId: customerId})

    const dayDeadlineOrder = getDayDeadlineOrder(customer)
    const weekNumber = getWeekNumber(new Date()); // Implement this function based on your logic
    const year = new Date().getFullYear();
    const settings = await Settings.findOne({tenantId: tenantId})
    const menus = await Menu.find({tenantId: tenantId})
    const weekplan = await Weekplan.findOne({tenantId: tenantId, year: year, week: weekNumber});
    const weekplanEdited = getMenusForWeekplan(weekplan, settings, {year: year, week: weekNumber},menus);
    const vacationCustomer = await Vacation.find({customerId: customerId})
    const permanentOrderStudents = await PermanentOrderStudent.find({customerId: customerId});
    const studentsCustomer = await StudentNew.find({customerId: customerId});
    const orderStudents = await OrderStudent.find({customerId: customerId, dateOrder: dayDeadlineOrder});
    const indexDay = getIndexDayOrder(dayDeadlineOrder);
    for (let eachPermanentOrderStudent of permanentOrderStudents) {

      let tenantStudent = await TenantParent.findOne({userId: eachPermanentOrderStudent.userId});
      let studentModel = getStudentById(eachPermanentOrderStudent.studentId, studentsCustomer);
      if (!studentModel) {
        continue
      }
      if(!eachPermanentOrderStudent.daysOrder[indexDay].selected){
        continue;
      }
      if (!studentHasNotPlacedOrderYet(eachPermanentOrderStudent, orderStudents, indexDay)) {
        continue;
      }

      const priceStudent = getPriceStudent(studentModel, customer, settings)

      let mockReq = {
        studentsCustomer: studentsCustomer,
        year: year,
        weekNumber: weekNumber,
        menus: menus,
        weekkplanDay: weekplanEdited.weekplan[indexDay],
        nameStudent: studentModel.firstName + ' ' + studentModel.lastName,
        dateOrderEdited: getInvoiceDateOne(dayDeadlineOrder),
        arrayEmail: [settings.orderSettings.confirmationEmail],
        nameCustomer: customer.contact.customer,
        priceStudent: getPriceStudent(studentModel, customer, settings),
        settings: settings,
        eachPermanentOrderStudent: eachPermanentOrderStudent,
        indexDay: indexDay,
        tenantId: tenantId,
        customerId: customerId,
        _id: eachPermanentOrderStudent.userId,
        tenantStudent: tenantStudent,
      };
      if(isHoliday(new Date(dayDeadlineOrder),customer.settings.state) || isVacation(dayDeadlineOrder,vacationCustomer)){
        await sendCancellationEmail(mockReq, 'Für den ausgewählten Tag ist ein Schließtag / Feiertag eingetragen. Sollte dies nicht korrekt sein, wenden Sie sich bitte an die Einrichtung'); // Handle cancellation email in a separate function
        continue;
      }

      mockReq.body = setOrderStudentBackend(customer, dayDeadlineOrder, tenantId, eachPermanentOrderStudent, weekplanEdited, settings, priceStudent,menus)
      // console.log('mockReq',mockReq.body)
      try {
        const response = await addOrder(mockReq, {});
        if (!response.success) {
          throw new Error(response.message);
        }

        await sendSuccessEmail(mockReq, response); // Handle success email in a separate function
      } catch (error) {
        // console.error('Failed to add order:', error.message); // Ensure error logging is detailed
        await sendCancellationEmail(mockReq, error.message); // Handle cancellation email in a separate function
      }
    }

    await sendEmailDailyConfirmation(weekplanEdited.weekplan[indexDay],settings,customer,studentsCustomer,dayDeadlineOrder)

  } catch
    (error) {
    console.error('Failed to check deadlines and send order email:', error);
    // Handle error appropriately
  }
}


async function sendEmailDailyConfirmation(weekplanDay, settings, customer, studentsCustomer, dayDeadlineOrder) {
  try {
    // Retrieve all orders
    const allOrders = await OrderStudent.find({ customerId: customer.customerId, dateOrder: dayDeadlineOrder });
    // Generate the email body for the customer
    const emailBodyCustomerDay = getEmailBodyOrderDayCustomer(weekplanDay, allOrders, settings, customer, studentsCustomer, dayDeadlineOrder);

    // Check if email body is defined
    if (!emailBodyCustomerDay) {
      console.log("No email to send, skipping...");
      return; // Exit the function if email body is null
    }

    // Send the email
    await sgMail.send(emailBodyCustomerDay);

    console.log("Email sent successfully");
  } catch (error) {
    // Log the error and handle it appropriately
    console.error("Failed to send daily confirmation email:", error);

    // Depending on your application's needs, you might also want to throw the error,
    // return it, or handle it in another specific way
    throw error; // This re-throws the caught error if you want to handle it further up the chain
  }
}


module.exports = processOrder;
