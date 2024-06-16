const sgMail = require("@sendgrid/mail");
const mongoose = require("mongoose");
const OrderStudent = mongoose.model('OrderStudent');
const {getOrderBody} = require("./email-order-old.function");
const {getOrdersStudent} = require("./deadline-orderclass.functions");
const {convertToSendGridFormat} = require("./sendfrid.controller");

async function sendEmailDailyConfirmationWeek(weekplan, settings, customer, currentWeek, currentYear, monday, studentsCustomer) {
  try {
    // Retrieve all orders
    const ordersStudentCustomer = await OrderStudent.find({
      customerId: customer.customerId,
      kw: currentWeek,
      year: currentYear
    });

    // Check if there are no orders and skip the email sending logic if true
    if (!ordersStudentCustomer || ordersStudentCustomer.length === 0) {
      console.log("No orders found, skipping email sending...");
      return; // Exit the function if there are no orders
    }

    const orderCustomer = getOrdersStudent(
      ordersStudentCustomer,
      customer,
      {queryYears: currentYear, queryCW: currentWeek},
      settings,
      weekplan,
      studentsCustomer
    );
    console.log("orderCustomer", orderCustomer);
    // Generate the email body for the customer
    let obj = {
      startDay: monday,
      type: 'order',
      customerInfo: customer,
      orderOverview: {queryYears: currentYear, queryCW: currentWeek},
      settings: settings,
      orderForEmail: orderCustomer.order,
      sendEmailCustomer: true,
      weekplanSelectedWeek: weekplan,
    }
    const emailBodyCustomerWeek = getOrderBody(obj);
    // Check if email body is defined
    if (!emailBodyCustomerWeek) {
      console.log("No email to send, skipping...");
      return; // Exit the function if email body is null
    }

    // // Send the email
    await sgMail.send(convertToSendGridFormat(emailBodyCustomerWeek));

    console.log("Email sent successfully");
  } catch (error) {
    // Log the error and handle it appropriately
    console.error("Failed to send daily confirmation email:", error);

    // Notify admin
    await notifyAdmin(error, customer.contact.email);

    // Depending on your application's needs, you might also want to throw the error,
    // return it, or handle it in another specific way
    throw error; // This re-throws the caught error if you want to handle it further up the chain
  }
}

async function notifyAdmin(error, customerEmail) {
  const msg = {
    to: 'error_email_notification@cateringexpert.de', // Admin email address
    from: '"Cateringexpert" <noreply@cateringexpert.de>', // sender address
    subject: 'Error Notification',
    text: `An error occurred: ${error.message}\n\n${error.stack}`,
    html: `<p>An Kunde: customerEmail</p><p>An error occurred: ${error.message}</p><pre>${error.stack}</pre>`,
  };

  try {
    await sgMail.send(msg);
    console.log('Admin notified successfully');
  } catch (err) {
    console.error('Failed to notify admin:', err);
  }
}

module.exports = {sendEmailDailyConfirmationWeek};
