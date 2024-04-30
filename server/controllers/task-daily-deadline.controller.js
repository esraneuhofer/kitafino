const {getWeekNumber} = require("./deadline-deadline.functions");
const {setOrderStudentBackend} = require("./order-functions");
const {getMenusForWeekplan} = require("./weekplan-functions");
const mongoose = require("mongoose");
const {getIndexDayOrder} = require("./deadline-orderclass.functions");
const Settings = mongoose.model('Settings');
const Customer = mongoose.model('Customer');
const PermanentOrderStudent = mongoose.model('PermanentOrderStudent');
const OrderStudent = mongoose.model('OrderStudent');
const Tenantparent = mongoose.model('Tenantparent');
const AccountSchema = mongoose.model('AccountSchema');
const Menu = mongoose.model('Menu');
const Weekplan = mongoose.model('Weekplan');
const StudentNew = mongoose.model('StudentNew');
let addOrderStudentDay = require('./order.controller').addOrderStudentDay;

let mockReq;

const mockRes = {
  json: function(result) {
    console.log('Response:', result);
  }
};

function studentHasNotPlacedOrderYet(permanentOrderStudent, orderStudents) {
    for (let eachOrderStudent of orderStudents) {
      if (permanentOrderStudent.studentId === eachOrderStudent.studentId) {
        return false;
      }
  }
  return true;
}

function getStundetById(studentId, studentsCustomer) {
  for (let eachStudent of studentsCustomer) {
    if (eachStudent._id.toString() === studentId.toString()) {
      return eachStudent;
    }
  }
  return null;
}

function getDayDeadlineOrder(customer) {
  let daysCustomer = customer.order.deadLineDaily.day;
  let today = new Date();

  // Add x days to today
  today.setDate(today.getDate() + daysCustomer);
  console.log('today', today);
  // Get the timezone offset in minutes and convert it to hours
  let offset = today.getTimezoneOffset() / 60;

  // Format the date in 'YYYY-MM-DDT00:00:00+HH:00' format
  // Adjust the timezone offset to ensure it always shows as +01:00
  let formattedDate = today.toISOString().split('T')[0] + 'T00:00:00+02:00';

  return formattedDate;
}
function setMockRequest(req) {
  return {
    tenantId: '651c635eca2c3d25809ce4f5',
    customerId:'6540b2117d2b64903bb4e3a2',
    _id:'65589d74e01397281ce02472',
  };
}
module.exports.addTaskAddOrder = async (req, res, next) => {
  mockReq = setMockRequest(req)
  let tenantId = '651c635eca2c3d25809ce4f5';
  let customerId = "6540b2117d2b64903bb4e3a2";
  let emailReminders = [];
  try {
    const settings = await Settings.findOne({tenantId: tenantId})
    const customer = await Customer.findOne({customerId: customerId})
    // const tenantStudents = await Tenantparent.find({customerId: customerId})
    // const accountsTenants = await AccountSchema.find({customerId: customerId})
    const menus = await Menu.find({tenantId: tenantId})
    const weekplan = await Weekplan.findOne({tenantId: req.tenantId, year: req.query.year, week: req.query.week});

    const dayDeadlineOrder = getDayDeadlineOrder(customer)
    const weekNumber = getWeekNumber(new Date()); // Implement this function based on your logic
    const year = new Date().getFullYear();

    const weekplanEdited = getMenusForWeekplan(weekplan, menus, settings, {year: year, week: weekNumber});

    const permanentOrderStudents = await PermanentOrderStudent.find({customerId: customerId});
    const studentsCustomer = await StudentNew.find({customerId: customerId});
    const orderStudents = await OrderStudent.find({customerId: customerId, dateOrder: dayDeadlineOrder});
    for (let eachPermanentOrderStudent of permanentOrderStudents) {
      const indexDay = getIndexDayOrder(dayDeadlineOrder);
      let studentModel = getStundetById(eachPermanentOrderStudent.studentId, studentsCustomer);
      if (!studentModel || (!studentHasNotPlacedOrderYet(eachPermanentOrderStudent, orderStudents, dayDeadlineOrder) && eachPermanentOrderStudent.daysOrder[indexDay].selected)) {
        continue
      }
      let newOrder = setOrderStudentBackend(customer, dayDeadlineOrder, tenantId, eachPermanentOrderStudent, weekplanEdited, settings, studentModel);
      mockReq.body  = newOrder;
      // Call the function
      await addOrderStudentDay(mockReq, mockRes);
      // let customer = getUserFromStudent()
      // if(isEmailFormat(eachCustomer.contact.email)) {
      //   let emailReminder = 8getEmailBodyReminder(
      //     settings,
      //     weekForOrder,
      //     deadline,
      //     eachCustomer.contact.email); // Assuming deadline is part of eachSetting or calculated inside getEmailBodyReminder
      //   emailReminders.push(emailReminder);
      // }
    // }

  }
  // for (let emailReminder of emailReminders) {
  //   try {
  //     // Capture the success response from sendMail
  //     const successResponse = await transporter.sendMail(emailReminder);
  //
  //     // Log the success response
  //     console.log(`Successfully sent email to ${emailReminder.to}:`, successResponse);
  //
  //     // Example of accessing specific data from the successResponse
  //     // console.log(`Message ID: ${successResponse.messageId}`);
  //   } catch (emailError) {
  //     console.error(`Failed to send email to ${emailReminder.to}:`, emailError);
  //   }
  // }
}

catch
(error)
{
  console.error('Failed to check deadlines and send order email:', error);
  // Handle error appropriately
}
}

// module.exports = {addTaskAddOrder};
