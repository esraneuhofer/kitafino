const mongoose = require("mongoose");
const OrderStudent = mongoose.model('OrderStudent');
const AccountSchema = mongoose.model('AccountSchema');
const OrdersAccountSchema = mongoose.model('OrdersAccountSchema');
const express = require('express');
const moment  = require('moment-timezone');


module.exports.getAccountOrderUserYear = async (req, res, next) => {
  try {
    const ordersAccountUser = await OrdersAccountSchema.find({year: req.query.year});
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

module.exports.addOrderStudentDay = async (req, res) => {
  req.body.tenantId = req.tenantId;
  req.body.customerId = req.customerId;
  req.body.userId = req._id;

  const orderAccount = prepareOrderDetails(req);
  const totalPrice = getTotalPrice(req.body);
  const session = await mongoose.startSession();
  await session.startTransaction();

  try {

    const account = await validateCustomerAccount(req._id, totalPrice, session);
    const orderId = new mongoose.Types.ObjectId();

    account.currentBalance -= totalPrice;

    // updateAccountWithOrder(account, orderAccount, orderId);
    await account.save({ session });

    await saveOrderAccount(orderAccount, orderId, session);

    await saveNewOrder(req.body, orderId, session);

    await session.commitTransaction();

    res.json({ success: true, message: 'Order placed successfully' });

  } catch (error) {
    await handleTransactionError(session, error, res);
  } finally {
    session.endSession();
  }
};

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
function getTotalPrice (order) {
  let totalPrice = 0;
  order.order.orderMenus.forEach((order) => {
    totalPrice += order.amountOrder * order.priceOrder;
  })
  order.order.specialFoodOrder.forEach((order) => {
    totalPrice += order.amountSpecialFood * order.priceMenu;
  })
  return totalPrice;
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
  await newOrder.save({ session });
}

async function handleTransactionError(session, error, res) {
  if (session.inTransaction()) {
    await session.abortTransaction();
  }
  res.json({ success: false, message: 'Failed to place order', error: error.message });

}

function getTotalPricesAllOrdersDate(allOrdersDate) {
  let totalPrice = 0;
  allOrdersDate.forEach((order) => {
    if(!order)return;
totalPrice += order.priceTotal;
  })
 return totalPrice;
}

module.exports.cancelOrderStudent = async (req, res, next) => {
  let orderId = req.body.orderId;
  const session = await mongoose.startSession();
  let totalPriceOrder = getTotalPrice(req.body)
  try {
    await session.startTransaction();

    // Step 1: Delete the OrderStudent document by orderId
    await deleteOrderStudentDocument(orderId, session);
    const account = await findAccount(req._id, session);

    const orderAccount = await findOrderAccount(orderId, session);

    const cancellationEntry = createCancellationEntry(orderAccount);
    orderAccount.allOrdersDate.push(cancellationEntry);
    orderAccount.priceAllOrdersDate = getTotalPricesAllOrdersDate(orderAccount.allOrdersDate);
    await orderAccount.save({ session });

    account.currentBalance -= cancellationEntry.priceTotal;
    await account.save({ session });

    // Finalize the transaction
    await session.commitTransaction();
    res.json({success: true, message: 'Order canceled successfully',data:cancellationEntry});
  } catch (error) {
    // If an error occurs, abort the transaction
    await session.abortTransaction();
    console.error('Error during order cancellation and update:', error);
    res.json({success: false, message: 'Order not canceled successfully',error:error});
  } finally {
    // End the session
    session.endSession();
  }
};

module.exports.editStudentOrder = async (req, res, next) => {

  let orderId = req.body.orderId; // Assuming this is passed in the request
  req.body.tenantId = req.tenantId;
  req.body.customerId = req.customerId;
  req.body.userId = req._id;
  const orderAccount = prepareOrderDetails(req);
  const totalPrice = getTotalPrice(req.body);

  const session = await mongoose.startSession();

  try {
    await session.startTransaction();

    await deleteOrderStudentDocument(orderId, session);

    // const account = await findAccount(req._id, session);
    const orderAccount = await findOrderAccount(orderId, session);

    const cancellationEntry = createCancellationEntry(orderAccount);

    orderAccount.allOrdersDate.push(cancellationEntry);
    orderAccount.priceAllOrdersDate = getTotalPricesAllOrdersDate(orderAccount.allOrdersDate);
    await orderAccount.save({ session });

    await updateAccountValidate(req._id, totalPrice, session);
    account.currentBalance -= cancellationEntry.priceTotal;

    // Step 2: Find the order in accountCustomerSchema and push a cancellation entry
    const accountCustomer = await AccountSchema.findOne({
      'orders.orderId': orderId
    }).session(session);
    const account = await validateCustomerAccount(req._id, totalPrice, session);

    // if (!accountCustomer) {
    //   throw new Error('Account customer with the specified order not found');
    // }
    //
    // const order = accountCustomer.orders.find(order => order.orderId === orderId);
    // if (!order || order.allOrdersDate.length === 0) {
    //   throw new Error('No entries in allOrdersDate to copy and modify');
    // }
    //
    // const newestEntry = order.allOrdersDate.reduce((latest, current) => {
    //   return latest.date > current.date ? latest : current;
    // });
    //
    // const newEntry = JSON.parse(JSON.stringify(newestEntry));
    // const priceTotal = newEntry.priceTotal;
    //
    // newEntry.date = moment.tz(req.body.date, 'Europe/Berlin').format();
    // newEntry.priceTotal = -Math.abs(priceTotal); // Ensure it's negative
    // newEntry.type = 'cancellation';
    //
    // order.allOrdersDate.push(newEntry);
    //
    //
    // let orderAccount = setOrderAccount(req.body);
    // let totalPriceEditOrder = getTotalPrice(orderAccount);
    //
    // order.allOrdersDate.push(
    //   {order:orderAccount,priceTotal:totalPriceEditOrder,type:'order',date:req.body.dateOrder}
    // )
    // accountCustomer.currentBalance += priceTotal;
    // accountCustomer.currentBalance -= totalPriceEditOrder;
    // // Save the modified document
    // await accountCustomer.save({ session });
    //
    // const newOrder = new OrderStudent(req.body);
    // newOrder.orderId = orderId;
    // newOrder.dateOrder = '2023-11-29T00:00:00+01:00'

    try {
      await newOrder.save({session});
    } catch (saveError) {
      // If saving the order fails, abort the transaction and throw the error
      await session.abortTransaction();
      throw saveError; // This will be caught by the outer catch block
    }

    await session.commitTransaction();

    res.json({success: true, message: 'Order placed successfully'});
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    res.json({ success: false, message: 'Failed to place order', error: error.message });
    // res.status(500).json({ success: false, message: 'Failed to place order', error: error.message });
    // Rollback the transaction on error
    // await session.abortTransaction();
    // next(error); // Use next to pass the error to Express error handling middleware
  } finally {
    // End the session
    session.endSession();
  }
};

async function deleteOrderStudentDocument(orderId, session) {
  const deleteResult = await OrderStudent.deleteOne({ orderId }).session(session);
  if (deleteResult.deletedCount === 0) {
    throw new Error('Order not found or already deleted');
  }
}

async function findAccount(userId, session) {
  const account = await AccountSchema.findOne({ userId }).session(session);
  if (!account) {
    throw new Error('Account not found');
  }
  return account;
}

async function findOrderAccount(orderId, session) {
  const orderAccount = await OrdersAccountSchema.findOne({ orderId }).session(session);
  if (!orderAccount) {
    throw new Error('Order account not found');
  }
  return orderAccount;
}

function createCancellationEntry(orderAccount) {
  const newestEntry = orderAccount.allOrdersDate.reduce((latest, current) => {
    return latest.date > current.date ? latest : current;
  });
  const newEntry = JSON.parse(JSON.stringify(newestEntry));
  newEntry.dateTimeOrder = moment.tz(new Date(), 'Europe/Berlin').format();
  newEntry.priceTotal = -Math.abs(newEntry.priceTotal); // Ensure it's negative
  newEntry.type = 'cancellation';
  return newEntry
}
