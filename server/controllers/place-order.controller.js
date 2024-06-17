const mongoose = require("mongoose");
const OrderStudent = mongoose.model('OrderStudent');
const OrdersAccountSchema = mongoose.model('OrdersAccountSchema');
const {getTotalPrice} = require('./order-functions');
const AccountSchema = mongoose.model('AccountSchema');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

async function addOrder(req) {
  req.body.tenantId = req.tenantId;
  req.body.customerId = req.customerId;
  req.body.userId = req._id;

  const orderAccount = prepareOrderDetails(req);

  const totalPrice = getTotalPrice(req.body);
  const session = await mongoose.startSession();

  try {
    await session.startTransaction();

    const account = await validateCustomerAccount(req._id, totalPrice, session);
    const orderId = new mongoose.Types.ObjectId();
    account.currentBalance -= totalPrice;

    await account.save({ session });
    await saveOrderAccount(orderAccount, orderId, session);

    //Testing///
    // req.body.dateOrder ='2024-05-06T00:00:00+02:00';
    // req.body = [];

    await saveNewOrder(req.body, orderId, session);

    await session.commitTransaction();

    return { success: true, message: 'Order placed successfully' };
  } catch (error) {
    console.log('error',error)
    await session.abortTransaction();
    // Forward the error from saveNewOrder
    throw new Error(error.message);
  } finally {
    session.endSession();
  }
}


async function validateCustomerAccount(userId, totalPrice, session) {
  const account = await AccountSchema.findOne({ userId }).session(session);
  if (!account) {
    const error = new Error('Das Kundenkonto konnte nicht gefunden werden.');
    error.status = 404; // Not Found
    throw error;
  } else if (account.currentBalance < totalPrice) {
    const error = new Error('Der Kontostand ist nicht ausreichend für diese Bestellung.');
    error.status = 402; // Payment Required
    throw error;
  }
  return account;
}

async function saveOrderAccount(orderDetails, orderId, session) {
  try {
    const newOrderAccount = new OrdersAccountSchema({
      tenantId: orderDetails.tenantId,
      customerId: orderDetails.customerId,
      userId: orderDetails.userId,
      studentId: orderDetails.studentId,
      orderId: orderId,
      dateOrderMenu: new Date(),
      year:dayjs.tz(orderDetails.dateOrder, 'Europe/Berlin').year(),
      priceAllOrdersDate: orderDetails.totalPrice,
      allOrdersDate: [
        { order: orderDetails.orderAccount, priceTotal: orderDetails.totalPrice, type: 'order', dateTimeOrder: new Date()}
      ]
    });
    await newOrderAccount.save({ session });
  } catch (error) {
    // Handle different types of errors that could occur during database operations
    handleDatabaseError(error, 'Error saving the order account');
  }
}

function handleDatabaseError(error, contextMessage) {
  console.error(contextMessage, error); // Log the error internally for debugging
  let httpStatusCode = 500; // Default to Internal Server Error
  let userMessage = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.';

  // Check if the error is a validation error (common with Mongoose operations)
  if (error.name === 'ValidationError') {
    httpStatusCode = 400; // Bad Request
    userMessage = 'Validierungsfehler bei der Bestellung. Bitte überprüfen Sie die eingegebenen Daten.';
  } else if (error.code === 11000) {
    httpStatusCode = 409; // Conflict
    userMessage = 'Ein doppelter Eintrag wurde erkannt. Bitte überprüfen Sie Ihre Bestellung.';
  }

  const customError = new Error(userMessage);
  customError.status = httpStatusCode;
  throw customError;
}

async function saveNewOrder(orderDetails, orderId, session) {
  const newOrder = new OrderStudent(orderDetails);
  newOrder.orderId = orderId;

  try {
    await newOrder.save({ session });
  } catch (error) {
    handleOrderError(error);
  }
}

function handleOrderError(error) {
  let httpStatusCode = 500; // Default to Internal Server Error
  let userMessage = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.';

  console.error("Error during order saving:", error); // Detailed logging for internal use
  if (error.code === 11000) {
    httpStatusCode = 409; // Conflict
    userMessage = 'Ein doppelter Eintrag wurde erkannt. Bitte überprüfen Sie Ihre Bestellung.';
  } else if (error.name && error.name === 'ValidationError') {
    httpStatusCode = 400; // Bad Request
    userMessage = 'Validierungsfehler. Bitte überprüfen Sie die eingegebenen Daten.';
  } else if (error.name && error.name === 'AuthError') {
    httpStatusCode = 401; // Unauthorized
    userMessage = 'Authentifizierungsfehler. Bitte erneut anmelden.';
  }

  const customError = new Error(userMessage);
  customError.status = httpStatusCode;
  throw customError;
}

function prepareOrderDetails(req) {
  const orderAccount = setOrderAccount(req.body);
  return {
    tenantId: req.tenantId,
    customerId: req.customerId,
    userId: req._id,
    studentId: req.body.studentId,
    dateOrder: req.body.dateOrder,
    orderAccount,
    totalPrice: getTotalPrice(req.body)
  };
}

function setOrderAccount(order) {
  let array = [];
  order.order.orderMenus.forEach((menu) => {
    if (menu.amountOrder > 0) {
      array.push({
        amount: menu.amountOrder,
        priceMenu: menu.priceOrder,
        nameOrder: menu.nameOrder,
        idType: menu.idType,
      })
    }
  })
  order.order.specialFoodOrder.forEach((menu) => {
    if (menu.amountSpecialFood > 0) {
      array.push({
        amount: menu.amountSpecialFood,
        priceMenu: menu.priceOrder,
        nameOrder: "Sonderessen",
        idType: menu.idSpecialFood,
      })
    }
  })
  return array;
}

module.exports.addOrderStudentDay = async (req, res) => {
  try {
    console.log('req',req.body)
    const result = await addOrder(req);
    res.json(result); // Successful response
  } catch (error) {
    console.error("Error placing order:", error);
    const statusCode = error.status || 500; // Use the status from the error, default to 500
    res.status(statusCode).json({ success: false, message: error.message });
  }
};


module.exports.addOrder = addOrder

