const mongoose = require("mongoose");
const OrderStudent = mongoose.model('OrderStudent');
const AccountSchema = mongoose.model('AccountSchema');
const express = require('express');


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
    console.log('account', account)
    // Perform Transaction
    account.currentBalance -= totalPrice;
    account.orders.push({
      studentId: req.body.studentId,
      orderId:orderId ,
      date: new Date(),
      order: orderAccount,
      priceTotal: totalPrice,
      type: 'order'
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

