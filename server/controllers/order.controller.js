const mongoose = require("mongoose");
const {convertToIsoDate} = require("./permanent-order.functions");
const {addDayFromDate} = require("./date.functions");
const OrderStudent = mongoose.model('OrderStudent');
const OrdersAccountSchema = mongoose.model('OrdersAccountSchema');

module.exports.getAccountOrderUserYear = async (req, res, next) => {
  try {
    const ordersAccountUser = await OrdersAccountSchema.find({userId:req._id,year: req.query.year});
    res.json(ordersAccountUser);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).send({message: 'Internal Server Error'});
  }
};

module.exports.getOrderStudentDay = async (req, res, next) => {
  try {
    const orderStudent = await OrderStudent.findOne({studentId: req.query.studentId, dateOrder: (req.query.dateOrder)});
    res.json(orderStudent);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).send({message: 'Internal Server Error'});
  }
};

module.exports.getOrderStudentWeek = async (req, res, next) => {
  try {
    const orderStudentWeek = await OrderStudent.find({ studentId:req.query.studentId, dateOrder: { $gte: convertToIsoDate(req.query.monday), $lt: convertToIsoDate(addDayFromDate(req.query.monday, 5)) } })
    // const orderStudent = await OrderStudent.findOne({studentId: req.query.studentId, dateOrder: req.query.dateOrder});
    res.json(orderStudentWeek);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).send({message: 'Internal Server Error'});
  }
};


module.exports.getOrderStudentYear = async (req, res, next) => {
  try {
    const orderStudent = await OrderStudent.find({userId: req._id, year: req.query.year});
    res.json(orderStudent);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).send({message: 'Internal Server Error'});
  }
};





