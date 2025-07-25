const mongoose = require('mongoose');
const OrderStudent = mongoose.model('OrderStudent');
const OrdersAccountSchema = mongoose.model('OrdersAccountSchema');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);
function normalizeToBerlinDate(date) {
  try {
    return dayjs(date).tz('Europe/Berlin').format('YYYY-MM-DD');
  } catch (error) {
    console.error('Fehler bei der Datums-Normalisierung:', error);
    return date;
  }
}

module.exports.getAccountOrderUserYear = async (req, res, next) => {
  try {
    const ordersAccountUser = await OrdersAccountSchema.find({ userId: req._id, year: req.query.year });
    res.json(ordersAccountUser);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).send({ message: 'Internal Server Error' });
  }
};

module.exports.getOrderStudentDay = async (req, res, next) => {
  try {
    const { studentId, dateOrder } = req.query;

    // console.log('getOrderStudentDay - Received params:', { studentId, dateOrder });

    // Nutze die statische Methode vom Model
    const orderStudent = await OrderStudent.findByStudentAndDay(
      studentId,
      dateOrder // Bereits im YYYY-MM-DD Format
    );

    // console.log(
    //   'getOrderStudentDay - Returning result:',
    //   orderStudent ? `Order for ${orderStudent.dateOrder}` : 'null'
    // );

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
    const userId = req._id; // Von Auth Middleware

    // Aktuelles Datum in Berlin-Zeit bestimmen (YYYY-MM-DD Format)
    const today = dayjs().tz('Europe/Berlin').format('YYYY-MM-DD');

    // Finde alle Bestellungen ab heute für den User
    const orders = await OrderStudent.find({
      userId: userId,
      dateOrder: { $gte: today }
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

module.exports.getFutureOrdersStudent = async (req, res) => {
  try {
    // Aktuelles Datum in Berlin-Zeit bestimmen (YYYY-MM-DD Format)
    const today = dayjs().tz('Europe/Berlin').format('YYYY-MM-DD');

    const orders = await OrderStudent.find({
      studentId: req.query.studentId,
      dateOrder: { $gte: today }
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

module.exports.getAllOrdersWithCancellations = async (req, res) => {
  try {
    const userId = req._id;
    const year = parseInt(req.query.year) || new Date().getFullYear();

    // Get the Order and OrderStudentCancel models
    const OrderStudent = mongoose.model('OrderStudent');
    const OrderStudentCancel = mongoose.model('OrderStudentCancel');

    // Get all regular orders for the user and year
    const regularOrders = await OrderStudent.find({
      userId: userId,
      year: year
    }).lean();

    // Get all cancelled orders for the user and year
    const cancelledOrders = await OrderStudentCancel.find({
      userId: userId,
      year: year
    }).lean();

    // Combine both arrays
    const combinedOrders = [...regularOrders, ...cancelledOrders];

    res.status(200).send(combinedOrders);
  } catch (error) {
    console.error('Error getting combined orders:', error);
    res.status(500).send({ message: 'Error retrieving orders' });
  }
};
