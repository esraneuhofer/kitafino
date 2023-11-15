const mongoose = require("mongoose");
const Settings = mongoose.model('Settings');
const Customer = mongoose.model('Customer');
const ArticleEdited = mongoose.model('ArticleEdited');
const ArticleDeclarations = mongoose.model('ArticleDeclarations');
const Menu = mongoose.model('Menu');
const Meal = mongoose.model('Meal');
const Weekplan = mongoose.model('Weekplan');


module.exports.getSettingsTenant = async (req, res, next) => {
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
    const customer = await Customer.findOne({ 'tenantId': req.tenantId });
    res.json(customer);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).send({ message: 'Internal Server Error' });
  }
};


module.exports.getWeekplanWeek = async (req, res, next) => {
  try {
    const weekplan = await Weekplan.findOne({tenantId: req.tenantId, year: req.query.year, week: req.query.week});
    res.json(weekplan);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).send({ message: 'Internal Server Error' });
  }
};

module.exports.getMeals = async (req, res, next) => {
  try {
    const meal = await Meal.findOne({ 'tenantId': req.tenantId });
    res.json(meal);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).send({ message: 'Internal Server Error' });
  }
};


module.exports.getMenus = async (req, res, next) => {
  try {
    const menu = await Menu.findOne({ 'tenantId': req.tenantId });
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
    const article = await ArticleEdited.findOne({ 'tenantId': req.tenantId });
    res.json(article);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).send({ message: 'Internal Server Error' });
  }
};
