const mongoose = require('mongoose');
const Settings = mongoose.model('Settings');
const Customer = mongoose.model('Customer');
const OrderStudent = mongoose.model('OrderStudent');
const StudentNew = mongoose.model('StudentNew');

const {getOrdersStudent,getWeekplanModel,getDateMondayFromCalenderweek} = require('./deadline-orderclass.functions');
const {getWeekNumber, getDeadline} = require('./deadline-deadline.functions');
const nodemailer = require("nodemailer");
const {getOrderBodyNew} = require('./deadline-email.functions');

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

async function checkDeadlinesSendOrderEmail() {
  try {
    // Assuming Customer and Settings models are already defined
    const customers = await Customer.find({ isCustomerNotStudent: false });
    const now = new Date();
    const currentWeek = getWeekNumber(now) +1 ;
    const currentYear = now.getFullYear();

    for (let eachCustomer of customers) {
      if (!eachCustomer.order.lastActionWeek || eachCustomer.order.lastActionWeek < currentWeek) {
        const settings = await Settings.findOne({ tenantId: eachCustomer.tenantId });
        let distance = getDeadline(settings.orderSettings, currentWeek, currentWeek, currentYear, currentYear);
        if (distance < 0) {
          const ordersStudentCustomer = await OrderStudent.find({ customerId: eachCustomer.customerId, kw: currentWeek, year: currentYear });
          const studentsCustomer = await StudentNew.find({ customerId: eachCustomer.customerId });
          const weekplanSelectedWeek = getWeekplanModel(settings, { year: currentYear, week: currentWeek });
          if (ordersStudentCustomer && ordersStudentCustomer.length > 0) {
            const orderCustomer = getOrdersStudent(
              ordersStudentCustomer,
              eachCustomer,
              { queryYears: currentYear, queryCW: currentWeek },
              settings,
              weekplanSelectedWeek.weekplan,
              studentsCustomer
            );
            let objectEmail = {
              startDay: getDateMondayFromCalenderweek(currentWeek, currentYear),
              type: 'order',
              customerInfo: eachCustomer,
              orderOverview: { queryYears: currentYear, queryCW: currentWeek },
              settings: settings,
              orderForEmail: orderCustomer.order,
              orderForEmailEdit: orderCustomer,
              sendEmailCustomer: true,
              weekplanSelectedWeek: weekplanSelectedWeek,
            };
            let emailBody = getOrderBodyNew(objectEmail);
            await eachCustomer.updateOne({ $set: { "order.lastActionWeek": currentWeek } });

            try {
              const info = await transporter.sendMail(emailBody);
              console.log('Mail sent:')
            } catch (error) {
              console.error('Error sending mail:', error);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error in checkDeadlinesSendOrderEmail:', error);
  }
}


// Schedule the job to run every minute
module.exports = {
    checkDeadlinesSendOrderEmail
};
