require('dotenv').config();
const sgMail = require('@sendgrid/mail');
const mongoose = require("mongoose");
const Settings = mongoose.model('Settings');
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
sgMail.setApiKey(process.env.SENDGRID_API_KEY);



module.exports.getSettingsCaterer = async (req, res, next) => {
  try {
    const setting = await Settings.findOne({ 'tenantId': req.tenantId });
    res.json(setting);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).send({ message: 'Internal Server Error' });
  }
};

module.exports.getCustomerInfo = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({ 'customerId': req.customerId });
    res.json(customer);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).send({ message: 'Internal Server Error' });
  }
};


module.exports.getWeekplanWeek = async (req, res, next) => {
  try {
    const weekplan = await Weekplan.findOne({tenantId:req.tenantId,year: req.query.year, week: req.query.week});
    res.json(weekplan);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).send({ message: 'Internal Server Error' });
  }
};
module.exports.getAssignedWeekplan = async (req, res, next) => {
  try {
    const assignedWeekplan = await AssignedWeekplan.find({year: req.query.year, week: req.query.week});
    res.json(assignedWeekplan);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).send({ message: 'Internal Server Error' });
  }
};

module.exports.getMeals = async (req, res, next) => {
  try {
    const meal = await Meal.find({ 'tenantId': req.tenantId });
    res.json(meal);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).send({ message: 'Internal Server Error' });
  }
};


module.exports.getMenus = async (req, res, next) => {
  try {
    const menu = await Menu.find({ 'tenantId': req.tenantId });
    res.json(menu);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).send({ message: 'Internal Server Error' });
  }
};


module.exports.getArticleDeclaration = async (req, res, next) => {
  try {
    const articleDeclarations = await ArticleDeclarations.findOne({ 'tenantId': req.tenantId });
    res.json(articleDeclarations);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).send({ message: 'Internal Server Error' });
  }
};

module.exports.getArticle = async (req, res, next) => {
  try {
    const article = await ArticleEdited.find({ 'tenantId': req.tenantId });
    res.json(article);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).send({ message: 'Internal Server Error' });
  }
};

module.exports.getWeekplanGroups = async (req, res, next) => {
  try {
    const weekplanGroups = await WeekplanGroup.find({ 'tenantId': req.tenantId });
    res.json(weekplanGroups);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).send({ message: 'Internal Server Error' });
  }
};

module.exports.getAssignedWeekplan = async (req, res, next) => {
  try {
    const assignedWeekplan = await AssignedWeekplan.find({ 'tenantId': req.tenantId });
    res.json(assignedWeekplan);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).send({ message: 'Internal Server Error' });
  }
};

module.exports.getVacationCustomer = async (req, res, next) => {
  try {
    const vacationCustomer = await Vacation.find({ 'customerId': req.customerId });
    res.json(vacationCustomer);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).send({ message: 'Internal Server Error' });
  }
};




module.exports.sendEmail = async (req, res, next) => {
  const mailOptions = req.body;

  try {
    // Senden der E-Mail mit SendGrid
    await sgMail.send(mailOptions);

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
    const pdf = await Weekplanpdf.findOne({ _id: req.query._id});
    res.json(pdf);
  } catch (err) {
    res.send(err);
  }
};
module.exports.getWeekplanPdfWeek = async (req, res, next) => {
  try {
    const pdf = await Weekplanpdf.find({ tenantId: req.tenantId, year:req.query.year, calenderWeek:req.query.week }, 'name year calenderWeek groups');
    res.json(pdf);
  } catch (err) {
    res.send(err);
  }
};

module.exports.getAllWeekplanPdf = async (req, res, next) => {
  try {
    const pdf = await Weekplanpdf.find({ tenantId: req.tenantId, year:req.query.year }, 'name calenderWeek groups');
    res.json(pdf);
  } catch (err) {
    res.send(err);
  }
};
