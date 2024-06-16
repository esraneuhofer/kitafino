const mongoose = require("mongoose");
const OrderStudent = mongoose.model('OrderStudent');
const OrdersAccountSchema = mongoose.model('OrdersAccountSchema');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

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
    const orderStudent = await OrderStudent.findOne({studentId: req.query.studentId, dateOrder: dayjs(req.query.dateOrder).tz('Europe/Berlin').toDate()});
    res.json(orderStudent);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).send({message: 'Internal Server Error'});
  }
};

module.exports.getOrderStudentWeek = async (req, res, next) => {
  try {
    const orderStudentWeek = await OrderStudent.find({ studentId:req.query.studentId,kw:req.query.kw, year: req.query.year})
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





