const mongoose = require("mongoose");
const OrderStudent = mongoose.model('OrderStudent');
const AccountSchema = mongoose.model('AccountSchema');
const OrdersAccountSchema = mongoose.model('OrdersAccountSchema');
const moment  = require('moment-timezone');


module.exports.cancelOrderStudent = async (req, res, next) => {
  let orderId = req.body.orderId;
  const session = await mongoose.startSession();
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

function getTotalPricesAllOrdersDate(allOrdersDate) {
  let totalPrice = 0;
  allOrdersDate.forEach((order) => {
    if(!order)return;
    totalPrice += order.priceTotal;
  })
  return totalPrice;
}


