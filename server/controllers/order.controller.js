const mongoose = require("mongoose");
const OrderStudent = mongoose.model('OrderStudent');





module.exports.getOrderStudentWeek = async (req, res, next) => {
  try {
    const orderStudent = await OrderStudent.findOne({studentId: req.studentId, year: req.query.year, week: req.query.week});
    res.json(orderStudent);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).send({ message: 'Internal Server Error' });
  }
};

