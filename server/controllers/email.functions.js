const {getNameMenuDay} = require("./order-functions");
const {getHtmlOrder: getEmailSuccess} = require("./email-order-regular");
const sgMail = require("@sendgrid/mail");
const {getEmailHtmlCancelPermanentOrder: getEmailCancel} = require("./email-permanent-order-cancel");

async function sendSuccessEmail(req, response) {
  try {
    const nameMenu = getNameMenuDay(req.eachPermanentOrderStudent.daysOrder[req.indexDay], req.weekkplanDay, req.settings);
    const emailBody = getEmailSuccess(
      req.nameCustomer,
      req.nameStudent,
      req.dateOrderEdited,
      nameMenu,
      req.priceStudent
    );
    let recipient = '';
    if(req.tenantStudent.orderSettings.orderConfirmationEmail){
      recipient = req.tenantStudent.email;
    }
    // recipient = 'test@cateringexpert.de'
    const emailBodyBasic = {
      from: `Cateringexpert <noreply@cateringexpert.de>`,
      bcc:'eltern_bestellung@cateringexpert.de',
      to: recipient, // list of receivers
      subject: 'Bestellung erfolgreich',
      html: emailBody
    };

    // Senden der E-Mail mit SendGrid
    await sgMail.send(emailBodyBasic);

    console.log('Successfully sent success email');
  } catch (error) {
    console.error('Failed to send success email:', error);

    // Je nach Bedarf können Sie den Fehler weiter werfen oder anders behandeln
    throw error; // Dieser Fehler wird erneut ausgelöst, wenn Sie ihn weiter oben in der Anrufkette behandeln möchten
  }
}

async function sendCancellationEmail(req, errorMessage) {
  try {
    const emailBody = getEmailCancel(
      req.nameStudent,
      req.dateOrderEdited,
      errorMessage
    );
    let recipient = '';
    if(req.tenantStudent.orderSettings.orderConfirmationEmail){
      recipient = req.tenantStudent.email;
    }
    // recipient = 'test@cateringexpert.de'
    const emailBodyBasic = {
      from: `Cateringexpert <noreply@cateringexpert.de>`,
      to: recipient, // list of receivers
      bcc:'eltern_bestellung@cateringexpert.de',
      subject: 'Bestellung nicht erfolgreich',
      html: emailBody
    };

    // Senden der E-Mail mit SendGrid
    await sgMail.send(emailBodyBasic);

    console.log('Successfully sent cancellation email');
  } catch (error) {
    console.error('Failed to send cancellation email:', error);

    // Je nach Bedarf können Sie den Fehler weiter werfen oder anders behandeln
    throw error; // Dieser Fehler wird erneut ausgelöst, wenn Sie ihn weiter oben in der Anrufkette behandeln möchten
  }
}

module.exports = {
  sendSuccessEmail,
  sendCancellationEmail
}
