const mongoose = require("mongoose");
const OrderStudent = mongoose.model('OrderStudent');
const AccountSchema = mongoose.model('AccountSchema');
const OrdersAccountSchema = mongoose.model('OrdersAccountSchema');
const OrderStudentCancel = mongoose.model('OrderStudentCancel');

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

class ApplicationError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends ApplicationError {
  constructor(message) {
    super(message || 'Resource not found.', 404);
  }
}

class DatabaseError extends ApplicationError {
  constructor(message) {
    super(message || 'Database error occurred.', 500);
  }
}


module.exports.cancelOrderStudent = async (req, res, next) => {
  const orderId = req.body.orderId;
  const session = await mongoose.startSession();
  try {
    await session.startTransaction();

    await OrderStudentCancel.editOrderToCancel(orderId, 'parent', session);

    // Delete the OrderStudent document by orderId
    await deleteOrderStudentDocument(orderId, session);

    const account = await findAccount(req._id, session);
    const orderAccount = await findOrderAccount(orderId, session);

    const cancellationEntry = createCancellationEntry(orderAccount);
    orderAccount.allOrdersDate.push(cancellationEntry);
    orderAccount.priceAllOrdersDate = 0;
    await saveOrderAccount(orderAccount, session);

    if(!orderAccount.isBut){
      account.currentBalance -= cancellationEntry.priceTotal;
    }

    await saveAccount(account, session);

    // Finalize the transaction
    await session.commitTransaction();
    res.status(200).json({success: true, message: 'Bestellung wurde erfolgreich storniert', data: cancellationEntry});
  } catch (error) {
    await session.abortTransaction();
    console.error('Error during order cancellation:', error);
    const status = error.statusCode || 500;
    res.status(status).json({ success: false, message: error.message || 'Bestellung konnte nicht storniert werden. Bitte versuchen Sie es erneut.' });
  } finally {
    session.endSession();
  }
};

async function saveOrderAccount(orderAccount, session) {
  try {
    await orderAccount.save({ session });
  } catch (error) {
    console.error("Fehler beim Speichern des Order-Kontos:", error);
    throw new DatabaseError(`Das Order-Konto konnte nicht gespeichert werden: ${error.message}`);
  }
}

async function saveAccount(account, session) {
  try {
    await account.save({ session });
  } catch (error) {
    console.error("Fehler beim Speichern des Account Kontos", error);
    throw new DatabaseError(`Das Account-Konto konnte nicht gespeichert werden: ${error.message}`);
  }
}

async function deleteOrderStudentDocument(orderId, session) {
  try {
    const deleteResult = await OrderStudent.deleteOne({ orderId }).session(session);
    if (deleteResult.deletedCount === 0) {
      throw new NotFoundError('Order not found or already deleted');
    }
  } catch (error) {
    console.error("Fehler beim Löschen des Order-Dokuments", error);
    throw new DatabaseError('Error while deleting the order document');
  }
}

async function findAccount(userId, session) {
  try {
    const account = await AccountSchema.findOne({ userId }).session(session);
    if (!account) {
      throw new NotFoundError('Kundenkonto konnte nicht gefunden werden');
    }
    return account;
  } catch (error) {
    console.error("Fehler beim Suchen des Kontos", error);
    throw new DatabaseError('Error while fetching the account');
  }
}

async function findOrderAccount(orderId, session) {
  try {
    const orderAccount = await OrdersAccountSchema.findOne({ orderId }).session(session);
    if (!orderAccount) {
      throw new NotFoundError(`Order-Konto wurde nicht gefunden.`);
    }
    return orderAccount;
  } catch (error) {
    console.error("Fehler beim Suchen des Order-Kontos", error);
    throw new DatabaseError('Error while fetching the order account');
  }
}


function createCancellationEntry(orderAccount) {
  const newestEntry = orderAccount.allOrdersDate.reduce((latest, current) => {
    return latest.date > current.date ? latest : current;
  });
  const newEntry = JSON.parse(JSON.stringify(newestEntry));
  newEntry.dateTimeOrder = dayjs().tz('Europe/Berlin').format();
  newEntry.priceTotal = -Math.abs(newEntry.priceTotal); // Ensure it's negative
  newEntry.type = 'cancellation';
  return newEntry
}


