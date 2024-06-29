const {convertToSendGridFormat} = require("./sendfrid.controller");
require('dotenv').config();
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


module.exports.deleteAccount = async (req, res, next) => {
  // Validierung der Eingaben
  if (req.query.email.length > 30 || req.query.contactperson.length > 30) {
    return res.send({ message: 'Error' });
  }

  // E-Mail-Optionen
  let mailOptions = {
    from: 'noreply@cateringexpert.de', // Absenderadresse
    to: req.query.email, // Liste der Empfänger
    bcc: 'e.neuhofer@cateringexpert.de', // Liste der BCC-Empfänger
    subject: 'Account auflösung beantragt', // Betreff
    html: `
      <html>
        <head>
          <style>
            .container {
              width: 500px;
              margin: 0 auto;
              text-align: center;
              font-family: Arial, sans-serif;
            }
            h1 {
              font-size: 24px;
              margin-bottom: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #ddd;
            }
            .btn {
              background-color: #4CAF50;
              color: white;
              padding: 12px 20px;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Vielen Dank für Ihre Anfrage!</h1>
            <p>Wir freuen uns, dass Sie unsere Anwendung für einen Monat testen möchten. Ein Mitarbeiter wird sich zeitnah bei Ihnen melden</p>
            <table>
              <tr>
                <th>Firma</th>
                <td id="username">${req.query.username}</td>
              </tr>
              <tr>
                <th>Kontaktperson</th>
                <td id="nameContactPerson">${req.query.contactperson}</td>
              </tr>
            </table>
          </div>
        </body>
      </html>
    `
  };
  let mailOptionsSendGrid = convertToSendGridFormat(mailOptions);
  try {
    // Senden der E-Mail mit SendGrid
    await sgMail.send(mailOptionsSendGrid);
    res.send({ message: 'Done' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.send({ message: 'Error' });
  }
};
