const mongoose = require("mongoose");
const OrderStudent = mongoose.model('OrderStudent');
const AccountSchema = mongoose.model('AccountSchema');
const express = require('express');
const moment  = require('moment-timezone');


module.exports.getOrderStudentDay = async (req, res, next) => {
  try {
    const orderStudent = await OrderStudent.findOne({studentId: req.query.studentId, dateOrder: req.query.dateOrder});
    res.json(orderStudent);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).send({message: 'Internal Server Error'});
  }
};


// module.exports.addOrderStudentDays = (req, res, next) => {
//   // Ensure that firstname and lastname are present in req.body
//   req.body.tenantId = req.tenantId;
//   req.body.customerId = req.customerId;
//
//   let newModel = new OrderStudent(req.body);
//
//   newModel.save().then(function (data) {
//     res.json({ student: data, error: false });
//   }, function (e) {
//     res.json({ student: e, error: true });
//   });
// }

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
        priceMenu: menu.priceMenu,
        nameOrder: "Sonderessen",
        idType: menu.idSpecialFood,
      })
    }
  })
  return array;
}

getTotalPrice = (orderAccount) => {
  let totalPrice = 0;
  orderAccount.forEach((order) => {
    totalPrice += order.amount * order.priceMenu;
  })
  return totalPrice;
}
module.exports.addOrderStudentDay = async (req, res, next) => {
  req.body.tenantId = req.tenantId;
  req.body.customerId = req.customerId; // Ensure this is correct
  req.body.userId = req._id
  let orderAccount = setOrderAccount(req.body);
  let totalPrice = getTotalPrice(orderAccount);
  const session = await mongoose.startSession();

  try {
    await session.startTransaction();

    // Fetch Customer Account
    const account = await AccountSchema.findOne({customerId: req.customerId}).session(session);
    if (!account || account.currentBalance < totalPrice) {
      throw new Error('Insufficient funds');
    }
    let orderId = new mongoose.Types.ObjectId();
    // Perform Transaction
    account.currentBalance -= totalPrice;
    account.orders.push({
      studentId: req.body.studentId,
      orderId:orderId ,
      date: req.body.dateOrder,
      priceAllOrdersDate: totalPrice,
      allOrdersDate: [
        {order:orderAccount,priceTotal:totalPrice,type:'order',date:req.body.dateOrder}],
    });
    await account.save({session});

    // Save the Order
    const newOrder = new OrderStudent(req.body);
    newOrder.orderId = orderId;
    // newOrder.dateOrder = '2023-11-29T00:00:00+01:00'

    try {
      await newOrder.save({session});
    } catch (saveError) {
      // If saving the order fails, abort the transaction and throw the error
      await session.abortTransaction();
      throw saveError; // This will be caught by the outer catch block
    }

    // Commit the transaction
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


module.exports.cancelOrderStudent = async (req, res, next) => {
  console.log(req.body)
  let orderId = req.body.orderId;
  console.log(orderId)
  const session = await mongoose.startSession();
  try {
    await session.startTransaction();

    // Step 1: Delete the OrderStudent document by orderId
    const deleteResult = await OrderStudent.deleteOne({ orderId: orderId }).session(session);
    if (deleteResult.deletedCount === 0) {
      throw new Error('OrderStudent document not found or already deleted');
    }

    // Step 2: Find the order in accountCustomerSchema and push a cancellation entry
    const accountCustomer = await AccountSchema.findOne({
      'orders.orderId': orderId
    }).session(session);

    if (!accountCustomer) {
      throw new Error('Account customer with the specified order not found');
    }

    const order = accountCustomer.orders.find(order => order.orderId === orderId);
    if (!order || order.allOrdersDate.length === 0) {
      throw new Error('No entries in allOrdersDate to copy and modify');
    }

    const newestEntry = order.allOrdersDate.reduce((latest, current) => {
      return latest.date > current.date ? latest : current;
    });

    const newEntry = JSON.parse(JSON.stringify(newestEntry));
    newEntry.date = moment.tz(req.body.date, 'Europe/Berlin').format();
    newEntry.priceTotal = -Math.abs(newEntry.priceTotal); // Ensure it's negative
    newEntry.type = 'cancellation';

    order.allOrdersDate.push(newEntry);
    accountCustomer.currentBalance += newestEntry.priceTotal;
    // Save the modified document
    await accountCustomer.save({ session });

    // Finalize the transaction
    await session.commitTransaction();
    res.json({success: true, message: 'Order canceled successfully'});
  } catch (error) {
    // If an error occurs, abort the transaction
    await session.abortTransaction();
    console.error('Error during order cancellation and update:', error);
    res.json({success: false, message: 'Order not canceled successfully'});
  } finally {
    // End the session
    session.endSession();
  }
};




