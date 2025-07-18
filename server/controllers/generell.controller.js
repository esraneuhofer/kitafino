require('dotenv').config();
const sgMail = require('@sendgrid/mail');
// const multer = require('multer');
const mongoose = require('mongoose');
const Settings = mongoose.model('Settings');
const WeekplanGroupSelection = mongoose.model('WeekplanGroupSelection');

const Customer = mongoose.model('Customer');
const ArticleEdited = mongoose.model('ArticleEdited');
const ArticleDeclarations = mongoose.model('ArticleDeclarations');
const Menu = mongoose.model('Menu');
const Meal = mongoose.model('Meal');
const Weekplan = mongoose.model('Weekplan');
const AssignedWeekplan = mongoose.model('AssignedWeekplanSchema');
const WeekplanGroup = mongoose.model('WeekplanGroup');
const Weekplanpdf = mongoose.model('WeekplanPdf');
const Vacation = mongoose.model('Vacation');
const Feedback = mongoose.model('FeedbackSchema');
const ErrorReport = mongoose.model('ErrorReport');
const { getEmailBodyOrderHistory } = require('./email-order-history');
const { convertToSendGridFormat } = require('./sendfrid.controller');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// const upload = multer();

module.exports.sendFeedback = (req, res, next) => {
  let newModel = new Feedback({
    message: req.body.message,
    createdAt: new Date(),
    customerId: req.customerId,
    tenantId: req.tenantId,
    userId: req._id
  });

  newModel
    .save()
    .then((data) => {
      console.log('Feedback saved successfully:', data);
      res.json({ student: data, error: false });
    })
    .catch((e) => {
      console.log('Feedback saved error:', e);
      res.json({ student: e, error: true });
    });
};

module.exports.reportError = async (req, res, next) => {
  try {
    const { message, typeError, route } = req.body;

    // Überprüfen, ob erforderliche Felder vorhanden sind
    if (!message || !typeError) {
      return res.status(400).json({
        success: false,
        message: 'Bitte füllen Sie alle erforderlichen Felder aus.'
      });
    }

    // Aktuelle Benutzerinformationen holen (falls authentifiziert)
    let userId = req._id;

    // Neuen Fehlerbericht erstellen
    const newErrorReport = new ErrorReport({
      message,
      typeError,
      route,
      userId
    });

    // Fehlerbericht in der Datenbank speichern
    const savedReport = await newErrorReport.save();

    // E-Mail an das Admin-Team
    const adminMsg = {
      to: 'error_email_notification@cateringexpert.de',
      from: 'noreply@cateringexpert.de',
      subject: `Neue Meldung: ${typeError.toUpperCase()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Neue Meldung eingegangen</h2>
          <p><strong>Typ:</strong> ${typeError}</p>
          <p><strong>Route:</strong> ${route}</p>
          <p><strong>Benutzer:</strong> ${userId || 'Nicht angemeldet'} </p>
          <p><strong>Nachricht:</strong></p>
          <p style="background-color: #f5f5f5; padding: 10px; border-radius: 5px;">${message}</p>
          <p><strong>ID:</strong> ${savedReport._id}</p>
          <p>Diese Meldung können Sie im Admin-Bereich bearbeiten.</p>
        </div>
      `
    };

    await sgMail.send(adminMsg);

    // Erfolgreiche Antwort an das Frontend senden
    return res.status(200).json({
      success: true,
      message: `Ihr ${typeError} wurde erfolgreich gemeldet. Vielen Dank für Ihre Mithilfe!`,
      typeError: typeError,
      reportId: savedReport._id
    });
  } catch (error) {
    console.error('Fehler beim Speichern des Fehlerberichts:', error);

    return res.status(500).json({
      success: false,
      message: 'Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.'
    });
  }
};

module.exports.getSettingsCaterer = async (req, res, next) => {
  try {
    const setting = await Settings.findOne({ tenantId: req.tenantId });
    res.json(setting);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).send({ message: 'Internal Server Error' });
  }
};

module.exports.healthcheck = (req, res) => {
  try {
    // Erfolgreiche Antwort senden, um anzuzeigen, dass der Server aktiv ist
    res.status(200).json({ message: 'Server is up and running' });
  } catch (err) {
    console.error(err); // Fehlerprotokollierung für Debugging
    res.status(500).send({ message: 'Internal Server Error' });
  }
};

module.exports.getCustomerInfo = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({ customerId: req.customerId });
    res.json(customer);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).send({ message: 'Internal Server Error' });
  }
};

module.exports.getWeekplanWeek = async (req, res, next) => {
  try {
    const weekplan = await Weekplan.findOne({ tenantId: req.tenantId, year: req.query.year, week: req.query.week });
    res.json(weekplan);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).send({ message: 'Internal Server Error' });
  }
};
module.exports.getAssignedWeekplan = async (req, res, next) => {
  try {
    const assignedWeekplan = await AssignedWeekplan.find({ year: req.query.year, week: req.query.week });
    res.json(assignedWeekplan);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).send({ message: 'Internal Server Error' });
  }
};

module.exports.getMeals = async (req, res, next) => {
  try {
    const meal = await Meal.find({ tenantId: req.tenantId });
    res.json(meal);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).send({ message: 'Internal Server Error' });
  }
};

module.exports.getMenus = async (req, res, next) => {
  try {
    const menu = await Menu.find({ tenantId: req.tenantId });
    res.json(menu);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).send({ message: 'Internal Server Error' });
  }
};

module.exports.getArticleDeclaration = async (req, res, next) => {
  try {
    const articleDeclarations = await ArticleDeclarations.findOne({ tenantId: req.tenantId });
    res.json(articleDeclarations);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).send({ message: 'Internal Server Error' });
  }
};

module.exports.getArticle = async (req, res, next) => {
  try {
    const article = await ArticleEdited.find({ tenantId: req.tenantId });
    res.json(article);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).send({ message: 'Internal Server Error' });
  }
};

module.exports.getWeekplanGroups = async (req, res, next) => {
  try {
    const weekplanGroups = await WeekplanGroup.find({ tenantId: req.tenantId });
    res.json(weekplanGroups);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).send({ message: 'Internal Server Error' });
  }
};

module.exports.getAssignedWeekplan = async (req, res, next) => {
  try {
    const assignedWeekplan = await AssignedWeekplan.find({ tenantId: req.tenantId });
    res.json(assignedWeekplan);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).send({ message: 'Internal Server Error' });
  }
};

module.exports.getVacationCustomer = async (req, res, next) => {
  try {
    const vacationCustomer = await Vacation.find({ customerId: req.customerId });
    res.json(vacationCustomer);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).send({ message: 'Internal Server Error' });
  }
};

module.exports.getWeekplanGroupSelection = async (req, res, next) => {
  try {
    // Find the WeekplanGroupSelection where customerId is contained in groupsWeekplanGroupSelection
    const weekplanGroupSelection = await WeekplanGroupSelection.findOne({
      'groupsWeekplanGroupSelection.customerId': req.customerId
    });

    // Einfach das Ergebnis zurückgeben, auch wenn es null ist
    res.json(weekplanGroupSelection);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).send({ message: 'Internal Server Error' });
  }
};

module.exports.sendEmail = async (req, res, next) => {
  const mailOptions = req.body;

  try {
    // Senden der E-Mail mit SendGrid
    await sgMail.send(convertToSendGridFormat(mailOptions));

    // Wenn die E-Mail erfolgreich gesendet wurde, senden Sie die Info zurück
    res.send({ message: 'Email sent successfully', info: mailOptions });
  } catch (error) {
    // Wenn ein Fehler auftritt, senden Sie den Fehler zurück
    console.error('Error sending email:', error);
    res.status(500).send(error);
  }
};

module.exports.getSingelWeekplanPdf = async (req, res, next) => {
  try {
    const pdf = await Weekplanpdf.findOne({ _id: req.query._id });
    res.json(pdf);
  } catch (err) {
    res.send(err);
  }
};
module.exports.getWeekplanPdfWeek = async (req, res, next) => {
  try {
    const pdf = await Weekplanpdf.find(
      { tenantId: req.tenantId, year: req.query.year, calenderWeek: req.query.week },
      'name year calenderWeek groups'
    );
    res.json(pdf);
  } catch (err) {
    res.send(err);
  }
};

module.exports.getAllWeekplanPdf = async (req, res, next) => {
  try {
    const pdf = await Weekplanpdf.find({ tenantId: req.tenantId, year: req.query.year }, 'name calenderWeek groups');
    res.json(pdf);
  } catch (err) {
    res.send(err);
  }
};

module.exports.sendCSVEmail = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'Keine Datei hochgeladen.' });
    }

    const firstDate = req.body.firstDate;
    const secondDate = req.body.secondDate;
    const type = req.body.type;
    const email = req.body.email;

    // Eingabevalidierung
    if (!firstDate || !secondDate || !type || !email) {
      return res.status(400).json({ error: 'Ungültige Eingabedaten.' });
    }

    const msg = {
      to: email, // Empfängeradresse
      from: '"Cateringexpert" <noreply@cateringexpert.de>', // Absenderadresse
      subject: `${type} vom ${firstDate} bis ${secondDate}`,
      text: 'Anbei finden Sie die angeforderte CSV-Datei.',
      attachments: [
        {
          content: file.buffer.toString('base64'),
          filename: file.originalname,
          type: file.mimetype,
          disposition: 'attachment'
        }
      ]
    };
    await sgMail.send(msg);

    console.log('E-Mail erfolgreich gesendet');
    res.status(200).json({ message: 'E-Mail erfolgreich gesendet' });
  } catch (error) {
    console.error('Fehler beim Senden der E-Mail:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
};

module.exports.sendPDFEmail = async (req, res, next) => {
  try {
    const file = req.file;
    const { firstDate, secondDate, type, email } = req.body;

    // Eingabevalidierung
    if (!file || !firstDate || !secondDate || !type || !email) {
      return res.status(400).json({ error: 'Ungültige Eingabedaten.' });
    }

    const msg = {
      to: email,
      from: '"Cateringexpert" <noreply@cateringexpert.de>',
      bcc: 'monitoring@cateringexpert.de',
      subject: `${type} vom ${firstDate} bis ${secondDate}`,
      html: getEmailBodyOrderHistory(),
      attachments: [
        {
          content: file.buffer.toString('base64'),
          filename: file.originalname,
          type: file.mimetype,
          disposition: 'attachment'
        }
      ]
    };

    await sgMail.send(msg);
    console.log('E-Mail erfolgreich gesendet', msg);
    res.status(200).json({ message: 'E-Mail erfolgreich gesendet' });
  } catch (error) {
    console.error('Fehler beim Senden der E-Mail:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
};
