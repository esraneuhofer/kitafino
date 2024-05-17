require('dotenv').config();
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const mongoose = require('mongoose');
const Settings = mongoose.model('Settings');
const Customer = mongoose.model('Customer');
const OrderStudent = mongoose.model('OrderStudent');
const StudentNew = mongoose.model('StudentNew');
const schedule = require("node-schedule");




const {getOrdersStudent,getDateMondayFromCalenderweek} = require('./deadline-orderclass.functions');
const {getWeekplanModel} = require('./weekplan-functions.js');
const {getWeekNumber} = require('./deadline-deadline.functions');
const {getOrderBodyNew} = require('./deadline-email.functions');
const {dateAndDayOfWeekToCron} = require('./date.functions');

async function addTaskSendReminder(customer, settings) {
  try {
    const now = new Date();
    const currentWeek = getWeekNumber(now) + 1;
    const currentYear = now.getFullYear();

    const ordersStudentCustomer = await OrderStudent.find({ customerId: customer.customerId, kw: currentWeek, year: currentYear });
    const studentsCustomer = await StudentNew.find({ customerId: customer.customerId });
    const weekplanSelectedWeek = getWeekplanModel(settings, { year: currentYear, week: currentWeek });

    if (ordersStudentCustomer && ordersStudentCustomer.length > 0) {
      const orderCustomer = getOrdersStudent(
        ordersStudentCustomer,
        customer,
        { queryYears: currentYear, queryCW: currentWeek },
        settings,
        weekplanSelectedWeek.weekplan,
        studentsCustomer
      );

      let objectEmail = {
        startDay: getDateMondayFromCalenderweek(currentWeek, currentYear),
        type: 'order',
        customerInfo: customer,
        orderOverview: { queryYears: currentYear, queryCW: currentWeek },
        settings: settings,
        orderForEmail: orderCustomer.order,
        orderForEmailEdit: orderCustomer,
        sendEmailCustomer: true,
        weekplanSelectedWeek: weekplanSelectedWeek,
      };

      let emailBody = getOrderBodyNew(objectEmail);

      const mailOptions = {
        to: customer.email, // Ensure you have the customer's email address
        from: 'noreply@yourdomain.com', // Your verified SendGrid sender address
        subject: 'Bestellungsübersicht für die Woche',
        html: emailBody // HTML body
      };

      try {
        await sgMail.send(mailOptions);
        console.log('Mail sent successfully');
      } catch (error) {
        console.error('Error sending mail:', error);
      }
    }
  } catch (error) {
    console.error('Error in checkDeadlinesSendOrderEmail:', error);
  }
}








async function loadAndScheduleTasks() {
  console.log('Loading and scheduling tasks...');
  const customers = await Customer.find({ isCustomerNotStudent: false });
  for(let eachCustomer of customers){
    const settingCustomer =await Settings.findOne({ tenantId: eachCustomer.tenantId });
    schedule.scheduleJob(dateAndDayOfWeekToCron(settingCustomer.orderSettings.deadlineWeekly), async () => {
      await addTaskSendReminder(eachCustomer,settingCustomer);
      // Optionally update task status in database after completion
    });
  };
}

// Schedule the job to run every minute
module.exports = {
  loadAndScheduleTasks
};

// async function checkDeadlinesSendOrderEmail() {
//   try {
//     // Assuming Customer and Settings models are already defined
//     const customers = await Customer.find({ isCustomerNotStudent: false });
//     const now = new Date();
//     const currentWeek = getWeekNumber(now) +1 ;
//     const currentYear = now.getFullYear();
//
//     for (let eachCustomer of customers) {
//       if (!eachCustomer.order.lastActionWeek || eachCustomer.order.lastActionWeek < currentWeek) {
//         const settings = await Settings.findOne({ tenantId: eachCustomer.tenantId });
//         let distance = getDeadline(settings.orderSettings, currentWeek, currentWeek, currentYear, currentYear);
//         if (distance < 0) {
//           const ordersStudentCustomer = await OrderStudent.find({ customerId: eachCustomer.customerId, kw: currentWeek, year: currentYear });
//           const studentsCustomer = await StudentNew.find({ customerId: eachCustomer.customerId });
//           const weekplanSelectedWeek = getWeekplanModel(settings, { year: currentYear, week: currentWeek });
//           if (ordersStudentCustomer && ordersStudentCustomer.length > 0) {
//             const orderCustomer = getOrdersStudent(
//               ordersStudentCustomer,
//               eachCustomer,
//               { queryYears: currentYear, queryCW: currentWeek },
//               settings,
//               weekplanSelectedWeek.weekplan,
//               studentsCustomer
//             );
//             let objectEmail = {
//               startDay: getDateMondayFromCalenderweek(currentWeek, currentYear),
//               type: 'order',
//               customerInfo: eachCustomer,
//               orderOverview: { queryYears: currentYear, queryCW: currentWeek },
//               settings: settings,
//               orderForEmail: orderCustomer.order,
//               orderForEmailEdit: orderCustomer,
//               sendEmailCustomer: true,
//               weekplanSelectedWeek: weekplanSelectedWeek,
//             };
//             let emailBody = getOrderBodyNew(objectEmail);
//             await eachCustomer.updateOne({ $set: { "order.lastActionWeek": currentWeek } });
//
//             try {
//               const info = await transporter.sendMail(emailBody);
//               console.log('Mail sent:')
//             } catch (error) {
//               console.error('Error sending mail:', error);
//             }
//           }
//         }
//       }
//     }
//   } catch (error) {
//     console.error('Error in checkDeadlinesSendOrderEmail:', error);
//   }
// }
