const mongoose = require("mongoose");
const Settings = mongoose.model('Settings');
const Customer = mongoose.model('Customer');
const ArticleEdited = mongoose.model('ArticleEdited');
const ArticleDeclarations = mongoose.model('ArticleDeclarations');
const Menu = mongoose.model('Menu');
const Meal = mongoose.model('Meal');
const Weekplan = mongoose.model('Weekplan');
const AssignedWeekplan = mongoose.model('AssignedWeekplanSchema');
var nodemailer = require('nodemailer');
const WeekplanGroup = mongoose.model('WeekplanGroup');

const transporter = nodemailer.createTransport({
  host: 'smtp.1und1.de',
  port: 465,
  secure: true, // secure:true for port 465, secure:false for port 587
  // service: 'Gmail',
  auth: {
    user: 'noreply@cateringexpert.de',
    pass: 'Master@Peterfischer1808!'
  }
});


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



module.exports.sendEmail = (req, res, next) =>{
  var mailOptions = req.body;
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      return res.send(error);
    }
    else {
      res.send(info)
    }
  })
};

