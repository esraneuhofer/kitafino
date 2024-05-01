const {getWeekNumber} = require("./deadline-deadline.functions");
const {setOrderStudentBackend, getPriceStudent, getNameMenuDay} = require("./order-functions");
const {getMenusForWeekplan} = require("./weekplan-functions");
const mongoose = require("mongoose");
const {getIndexDayOrder} = require("./deadline-orderclass.functions");
const Settings = mongoose.model('Settings');
const Customer = mongoose.model('Customer');
const PermanentOrderStudent = mongoose.model('PermanentOrderStudent');
const OrderStudent = mongoose.model('OrderStudent');
const Menu = mongoose.model('Menu');
const Weekplan = mongoose.model('Weekplan');
const StudentNew = mongoose.model('StudentNew');
const {addOrder} = require('./place-order.controller');
let getEmailSuccess = require('./email-order-regular').getHtmlOrder;
let getEmailCancel = require('./email-permanent-order-cancel').getEmailHtmlCancelPermanentOrder;
const nodemailer = require('nodemailer');
const getInvoiceDateOne = require('./date.functions').getInvoiceDateOne;
const {studentHasNotPlacedOrderYet, getStundetById, getDayDeadlineOrder} = require("./permanent-order.functions");
const transporter = nodemailer.createTransport({
  host: 'smtp.1und1.de',
  port: 465,
  secure: true, // secure:true for port 465, secure:false for port 587
  // service: 'Gmail',
  auth: {
    user: 'noreply@cateringexpert.de',
    pass: '5/5e_FBw)JWTXpu!!adsaaa22'
  }
});
let mockReq;


function setMockRequest(req) {
  return {
    tenantId: '651c635eca2c3d25809ce4f5',
    customerId: '6540b2117d2b64903bb4e3a2',
    _id: '65589d74e01397281ce02472',
  };
}

module.exports.addTaskAddOrder = async (req, res, next) => {
  mockReq = setMockRequest(req)
  let tenantId = '651c635eca2c3d25809ce4f5';
  let customerId = "6540b2117d2b64903bb4e3a2";
  try {
    const customer = await Customer.findOne({customerId: customerId})
    const dayDeadlineOrder = getDayDeadlineOrder(customer)
    const weekNumber = getWeekNumber(new Date()); // Implement this function based on your logic
    const year = new Date().getFullYear();

    const settings = await Settings.findOne({tenantId: tenantId})
    const menus = await Menu.find({tenantId: tenantId})
    const weekplan = await Weekplan.findOne({tenantId: tenantId, year: year, week: weekNumber});
    const weekplanEdited = getMenusForWeekplan(weekplan, settings, {year: year, week: weekNumber});

    const permanentOrderStudents = await PermanentOrderStudent.find({customerId: customerId});
    const studentsCustomer = await StudentNew.find({customerId: customerId});
    const orderStudents = await OrderStudent.find({customerId: customerId, dateOrder: dayDeadlineOrder});
    for (let eachPermanentOrderStudent of permanentOrderStudents) {
      const indexDay = getIndexDayOrder(dayDeadlineOrder);
      let studentModel = getStundetById(eachPermanentOrderStudent.studentId, studentsCustomer);
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
      let newOrder = setOrderStudentBackend(customer, dayDeadlineOrder, tenantId, eachPermanentOrderStudent, weekplanEdited, settings, priceStudent,menus);
      mockReq.body = newOrder;
      mockReq.menus = menus
      mockReq.weekkplanDay = weekplanEdited.weekplan[indexDay];
      mockReq.nameStudent = studentModel.firstName + ' ' + studentModel.lastName;
      mockReq.dateOrderEdited = getInvoiceDateOne(dayDeadlineOrder);
      mockReq.arrayEmail = [settings.orderSettings.confirmationEmail]
      mockReq.nameCustomer = customer.contact.customer;
      mockReq.priceStudent = priceStudent;
      mockReq.settings = settings;
      mockReq.eachPermanentOrderStudent = eachPermanentOrderStudent;
      mockReq.indexDay = indexDay;

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
  } catch
    (error) {
    console.error('Failed to check deadlines and send order email:', error);
    // Handle error appropriately
  }
}

// module.exports = {addTaskAddOrder};
async function sendSuccessEmail(req, response) {
  const nameMenu = getNameMenuDay(req.eachPermanentOrderStudent.daysOrder[req.indexDay],req.weekkplanDay,req.menus,req.settings);
  console.log('nameMenu:', nameMenu);
  const emailBody = getEmailSuccess(
    req.nameCustomer,
    req.nameStudent,
    req.dateOrderEdited,
    nameMenu,
    req.priceStudent
  );

  const emailBodyBasic = {
    from: `${req.settings.tenantSettings.contact.companyName} <noreply@cateringexpert.de>`,
    replyTo: req.settings.orderSettings.confirmationEmail,
    to: req.arrayEmail, // list of receivers
    subject: 'Bestellung erfolgreich',
    html: emailBody
  };

  const successResponse = await transporter.sendMail(emailBodyBasic);
  // console.log(`Successfully sent success email:`, successResponse);
}

async function sendCancellationEmail(req, errorMessage) {
  console.log('Error____:', errorMessage);
  const emailBody = getEmailCancel(
    req.nameStudent,
    req.dateOrderEdited,
    errorMessage
  );
  const emailBodyBasic = {
    from: `${req.settings.tenantSettings.contact.companyName} <noreply@cateringexpert.de>`,
    replyTo: req.settings.orderSettings.confirmationEmail,
    to: req.arrayEmail, // list of receivers
    subject: 'Bestellung nicht erfolgreich',
    html: emailBody
  };

  const emailResponse = await transporter.sendMail(emailBodyBasic);
  // console.log(`Successfully sent cancellation email:`, emailResponse);
}
