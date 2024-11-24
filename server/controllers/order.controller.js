const mongoose = require("mongoose");
const OrderStudent = mongoose.model('OrderStudent');
const OrdersAccountSchema = mongoose.model('OrdersAccountSchema');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);
function normalizeToBerlinDate(date) {
  try {
    return dayjs(date)
      .tz('Europe/Berlin')
      .format('YYYY-MM-DD');
  } catch (error) {
    console.error('Fehler bei der Datums-Normalisierung:', error);
    return date;
  }
}


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
    const { studentId, dateOrder } = req.query;

    // Nutze die statische Methode vom Model
    const orderStudent = await OrderStudent.findByStudentAndDay(
      studentId,
      dateOrder // Bereits im YYYY-MM-DD Format
    );

    res.json(orderStudent);
  } catch (err) {
    console.error('Error fetching student order:', err);
    res.status(500).json({
      message: 'Fehler beim Abrufen der Bestellung',
      error: err.message
    });
  }
};


module.exports.getFutureOrders = async (req, res) => {
  try {
    // const startDate = normalizeToBerlinDate(req.query.startDate);
    const userId = req._id; // Von Auth Middleware
    console.log('userId:', userId);
    // Finde alle Bestellungen ab startDate für den User
    const orders = await OrderStudent.find({
      userId: userId,
      dateOrder: { $gte: req.query.startDate }
    })
      .sort({ dateOrder: 1 })
      .lean();

    res.json(orders);
  } catch (error) {
    console.error('Error fetching future orders:', error);
    res.status(500).json({
      message: 'Fehler beim Laden zukünftiger Bestellungen',
      error: error.message
    });
  }
};


