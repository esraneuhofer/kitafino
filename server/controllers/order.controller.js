const mongoose = require("mongoose");
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
    const orderStudent = await OrderStudent.findOne({studentId: req.query.studentId, dateOrder: req.query.dateOrder});
    res.json(orderStudent);
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





