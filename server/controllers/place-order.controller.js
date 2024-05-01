const mongoose = require("mongoose");
const OrderStudent = mongoose.model('OrderStudent');
const AccountSchema = mongoose.model('AccountSchema');
const OrdersAccountSchema = mongoose.model('OrdersAccountSchema');
const moment  = require('moment-timezone');
const {getTotalPrice} = require('./order-functions');

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
    await saveNewOrder(req.body, orderId, session);

    await session.commitTransaction();
    session.endSession();

    return { success: true, message: 'Order placed successfully' };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    // Forward the error from saveNewOrder
    throw new Error(error.message);
  }
}


async function validateCustomerAccount(userId, totalPrice, session) {
  const account = await AccountSchema.findOne({ userId }).session(session);
  if (!account || account.currentBalance < totalPrice) {
    throw new Error('Der Kontostand ist nicht ausreichend');
  }
  return account;
}

async function saveOrderAccount(orderDetails, orderId,session) {
  const newOrderAccount = new OrdersAccountSchema({
    tenantId: orderDetails.tenantId,
    customerId: orderDetails.customerId,
    userId: orderDetails.userId,
    studentId: orderDetails.studentId,
    orderId: orderId,
    dateOrderMenu: new Date(),
    year: moment.tz(orderDetails.dateOrder, 'Europe/Berlin').year(),
    priceAllOrdersDate: orderDetails.totalPrice,
    allOrdersDate: [
      { order: orderDetails.orderAccount, priceTotal: orderDetails.totalPrice, type: 'order', dateTimeOrder: new Date()}
    ]
  });
  await newOrderAccount.save({ session });
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
  if (error.code === 11000) {
    // Log the error internally for debugging
    // console.error("Duplicate order error:", error);
    // Throw a user-friendly error
    throw new Error('Es wurde bereits eine Bestellung für diesen Tag eingetragen');
  } else {
    // Log unexpected errors
    // console.error("Unexpected error during order saving:", error);
    // Throw a general error for unexpected issues
    throw new Error('Beim Speichern Ihrer Bestellung ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.');
  }
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
    const result = await addOrder(req);
    res.json(result);
  } catch (error) {
    console.error("Error placing order: ", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


module.exports.addOrder = addOrder

