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

const {
  getStudentById,
  isVacation
} = require("./permanent-order.functions");
const {getMenusForWeekplan} = require("./weekplan-functions");
const {getPriceStudent, setOrderStudentBackend} = require("./order-functions");
const {getInvoiceDateOne,calculateTargetWeekAndYear,getDateMondayFromCalenderweek, addDayFromDate} = require("./date.functions");
const {isHoliday} = require("feiertagejs");
const {addOrder} = require("./place-order.controller");
const {sendSuccessEmail, sendCancellationEmail} = require("./email.functions");
const {sendEmailDailyConfirmationWeek} = require("./email-order-customer-weekly");

async function processOrderWeekly(customerId, tenantId) {
  try {
    const customer = await Customer.findOne({ customerId: customerId });
    if (!customer) throw new Error('Customer not found');

    const deadLine = customer.generalSettings.deadlineWeekly;
    const { targetWeek, targetYear } = calculateTargetWeekAndYear(deadLine.weeks);
    const monday = getDateMondayFromCalenderweek(targetWeek, targetYear);
    const settings = await Settings.findOne({ tenantId: tenantId });
    const menus = await Menu.find({ tenantId: tenantId });
    const weekplan = await Weekplan.findOne({ tenantId: tenantId, year: targetYear, week: targetWeek });
    const weekplanEdited = getMenusForWeekplan(weekplan, settings, { year: targetYear, week: targetWeek }, menus);
    const [vacationCustomer, permanentOrderStudents, studentsCustomer] = await Promise.all([
      Vacation.find({ customerId: customerId }),
      PermanentOrderStudent.find({ customerId: customerId }),
      StudentNew.find({ customerId: customerId }),
    ]);

    for (let eachPermanentOrderStudent of permanentOrderStudents) {
      let tenantStudent = await TenantParent.findOne({ userId: eachPermanentOrderStudent.userId });
      let studentModel = getStudentById(eachPermanentOrderStudent.studentId, studentsCustomer);
      if (!studentModel) continue;

      const priceStudent = getPriceStudent(studentModel, customer, settings);
      let mockReq;

      for (let indexDay = 0; indexDay <= 5; indexDay++) {
        if (!eachPermanentOrderStudent.daysOrder || !eachPermanentOrderStudent.daysOrder[indexDay] || !eachPermanentOrderStudent.daysOrder[indexDay].selected) continue;

        let day = addDayFromDate(monday, indexDay);
        if (isHoliday(day, customer.settings.state) || isVacation(day, vacationCustomer)) {
          try {
            // await sendCancellationEmail(mockReq, 'Für den ausgewählten Tag ist ein Schließtag / Feiertag eingetragen. Sollte dies nicht korrekt sein, wenden Sie sich bitte an die Einrichtung');
          } catch (error) {
            console.error('Failed to send cancellation email:', error.message);
          }
        } else {
          mockReq = createMockRequest(day, studentModel, eachPermanentOrderStudent, weekplanEdited, settings, priceStudent, tenantStudent, tenantId, customerId, customer, studentsCustomer, targetWeek, targetYear, menus, indexDay);
          if (mockReq.error) {
            console.error('Skipping order due to error:', mockReq.errorMessage);
            continue;
          }
          try {
            const response = await addOrder(mockReq, {});
            // if (!response.success) throw new Error(response.message);
            try {
              await sendSuccessEmail(mockReq, response);
            } catch (error) {
              console.error('Failed to send success email:', error.message);
            }
          } catch (error) {
            // console.error('Failed to add order:', error.message);
            try {
              await sendCancellationEmail(mockReq, error.message);
            } catch (emailError) {
              console.error('Failed to send cancellation email:', emailError.message);
            }
          }
        }
      }
    }

    // Assuming dayDeadlineOrder and indexDay are correctly defined
    try {
      await sendEmailDailyConfirmationWeek(weekplanEdited.weekplan, settings, customer,targetWeek,targetYear, monday, studentsCustomer);
    } catch (error) {
      console.error('Failed to send daily confirmation email:', error.message);
    }
  } catch (error) {
    console.error('Failed to check deadlines and send order email:', error);
    throw error; // Re-throw the error to be caught in the outer try-catch block
  }
}




function createMockRequest(day, studentModel, eachPermanentOrderStudent, weekplanEdited, settings, priceStudent, tenantStudent, tenantId, customerId, customer, studentsCustomer, targetWeek, targetYear, menus, indexDay) {
  let mockReq = {};

  try {
    const body = setOrderStudentBackend(customer, day, tenantId, eachPermanentOrderStudent, weekplanEdited, settings, priceStudent, menus);

    mockReq = {
      studentsCustomer: studentsCustomer,
      year: targetYear,
      weekNumber: targetWeek,
      menus: menus,
      weekkplanDay: weekplanEdited.weekplan[indexDay],
      nameStudent: studentModel.firstName + ' ' + studentModel.lastName,
      dateOrderEdited: getInvoiceDateOne(day),
      arrayEmail: [settings.orderSettings.confirmationEmail],
      nameCustomer: customer.contact.customer,
      priceStudent: priceStudent,
      settings: settings,
      eachPermanentOrderStudent: eachPermanentOrderStudent,
      indexDay: indexDay,
      tenantId: tenantId,
      customerId: customerId,
      _id: eachPermanentOrderStudent.userId,
      tenantStudent: tenantStudent,
      body: body
    };

  } catch (error) {
    console.error('Error in setOrderStudentBackend:', error.message);
    mockReq.error = true; // Mark the request as having an error
    mockReq.errorMessage = error.message; // Add the error message to the request
  }

  return mockReq;
}




const testing = async (req, res) => {
  try {
    let tenantIdString = '651c635eca2c3d25809ce4f5';
    let customerIdString = "6540b2117d2b64903bb4e3a2";

    // Convert strings to ObjectId
    const customerId = new mongoose.Types.ObjectId(customerIdString);
    const tenantId = new mongoose.Types.ObjectId(tenantIdString);

    // Call the processOrderWeekly function
    await processOrderWeekly(customerId, tenantId);

    res.status(200).send({ message: 'Parent tenant edited successfully' });
  } catch (error) {
    console.error('Error in testing function:', error); // Log the error for debugging
    res.status(500).send({ error: 'Failed to edit parent tenant' });
  }
};

module.exports = { processOrderWeekly, testing };



