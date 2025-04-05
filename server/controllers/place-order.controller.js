const mongoose = require("mongoose");
const OrderStudent = mongoose.model('OrderStudent');
const OrdersAccountSchema = mongoose.model('OrdersAccountSchema');
const {getTotalPrice} = require('./order-functions');
const AccountSchema = mongoose.model('AccountSchema');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const Tenantparent = mongoose.model('Tenantparent');
const Student = mongoose.model('StudentNew');

const {setEmailReminder} = require('./email-balance-reminder');
const sgMail = require("@sendgrid/mail");
const {convertToSendGridFormat} = require("./sendfrid.controller");
dayjs.extend(utc);
dayjs.extend(timezone);


function isWeekend(date) {
  let d = new Date(date);
  const dayOfWeek = d.getDay(); // 0 = Sonntag, 1 = Montag, ..., 6 = Samstag
  return dayOfWeek === 0 || dayOfWeek === 6; // true, wenn Samstag oder Sonntag
}


async function addOrderBut(req) {
  req.body.tenantId = req.tenantId;
  req.body.customerId = req.customerId;
  req.body.userId = req._id;
  req.body.orderPlacedBy = 'parent';
  const orderAccount = prepareOrderDetails(req);
  const totalPrice = getTotalPrice(req.body);
  const session = await mongoose.startSession();

  try {
    if(isWeekend(req.body.dateOrder)){
      throw new Error(`Bestellungen sind am Wochenende nicht möglich.`);
    }
    await session.startTransaction();
    // const tenantAccount = await Tenantparent.findOne({ userId: req._id }).session(session);

    // Abrufen des Schülers mit Error-Handling
    const student = await Student.findOne({ _id: req.body.studentId }).session(session);
    if (!student) {
      throw new Error(`Schüler mit ID ${req.body.studentId} nicht gefunden.`);
    }

    // Setzen der Gruppenkennung
    req.body.subgroup = student.subgroup;

    // const account = await validateCustomerAccount(req._id, totalPrice, session);
    const orderId = new mongoose.Types.ObjectId();
    // account.currentBalance -= totalPrice;
    //
    // if (tenantAccount.orderSettings.sendReminderBalance && account.currentBalance < tenantAccount.orderSettings.amountBalance) {
    //   let emailBody = setEmailReminder(account.currentBalance, tenantAccount.email);
    //   try {
    //     await sgMail.send(convertToSendGridFormat(emailBody));
    //   } catch (emailError) {
    //     console.log('Error sending email:', emailError);
    //     // Optionally handle email error, e.g., log it or notify an admin
    //   }
    // }

    // await account.save({ session });
    await saveOrderAccount(orderAccount, orderId, session,req.body.isBut);

    // Testing
    // req.body.dateOrder = '2024-05-06T00:00:00+02:00';
    // req.body = [];

    await saveNewOrder(req.body, orderId, session);
    await session.commitTransaction();

    return { success: true, message: 'Order placed successfully' };
  } catch (error) {
    console.log('Error:', error);
    await session.abortTransaction();
    // Forward the error from saveNewOrder
    throw new Error(error.message);
  } finally {
    session.endSession();
  }
}

async function addOrder(req) {
  let session = null;

  try {
    // Session außerhalb der try-Block definieren, damit wir sie in finally sicher beenden können
    session = await mongoose.startSession();
    await session.startTransaction();

    // Validierung der Eingabedaten
    if (!req.body || !req.body.dateOrder || !req.body.studentId) {
      throw new Error('Unvollständige Bestelldaten. Bitte alle erforderlichen Felder ausfüllen.');
    }

    // Zuweisen der IDs
    req.body.tenantId = req.tenantId;
    req.body.customerId = req.customerId;
    req.body.userId = req._id;
    req.body.orderPlacedBy = 'parent';

    // Berechnung des Gesamtpreises
    const totalPrice = getTotalPrice(req.body);
    if (totalPrice <= 0) {
      throw new Error('Ungültiger Bestellbetrag. Der Gesamtpreis muss größer als 0 sein.');
    }

    // Prüfung, ob Bestellung am Wochenende
    if (isWeekend(req.body.dateOrder)) {
      throw new Error('Bestellungen sind am Wochenende nicht möglich.');
    }

    // Abrufen des Tenant-Accounts mit Error-Handling
    const tenantAccount = await Tenantparent.findOne({ userId: req._id }).session(session);
    if (!tenantAccount) {
      throw new Error('Tenant-Account nicht gefunden.');
    }

    // Abrufen des Schülers mit Error-Handling
    const student = await Student.findOne({ _id: req.body.studentId }).session(session);
    if (!student) {
      throw new Error(`Schüler mit ID ${req.body.studentId} nicht gefunden.`);
    }

    // Setzen der Gruppenkennung
    req.body.subgroup = student.subgroup;

    // Validierung des Kundenkontos
    const account = await validateCustomerAccount(req._id, totalPrice, session);

    
    // Erzeugen einer eindeutigen Bestellnummer
    const orderId = new mongoose.Types.ObjectId();

    // Aktualisierung des Kontostands
    account.currentBalance -= totalPrice;

    // E-Mail-Benachrichtigung bei niedrigem Kontostand
    if (tenantAccount.orderSettings.sendReminderBalance &&
      account.currentBalance < tenantAccount.orderSettings.amountBalance) {
      let emailBody = setEmailReminder(account.currentBalance, tenantAccount.email);
      try {
        await sgMail.send(convertToSendGridFormat(emailBody));
      } catch (emailError) {
        console.log('Fehler beim Senden der E-Mail:', emailError);
        // Wir lassen die Transaktion trotz E-Mail-Fehler weiterlaufen
      }
    }

    // Vorbereitung der Bestelldetails
    const orderAccount = prepareOrderDetails(req);

    // Speichern des aktualisierten Kontos
    await account.save({ session });

    // Speichern der Bestellinformationen
    await saveOrderAccount(orderAccount, orderId, session, req.body.isBut);

    // Speichern der neuen Bestellung
    await saveNewOrder(req.body, orderId, session);

    // Transaktion abschließen
    await session.commitTransaction();

    return {
      success: true,
      message: 'Bestellung erfolgreich aufgegeben',
      orderId: orderId.toString(),
      balance: account.currentBalance
    };

  } catch (error) {
    console.error('Fehler bei der Bestellverarbeitung:', error);

    // Nur Transaktion abbrechen, wenn sie gestartet wurde
    if (session && session.inTransaction()) {
      await session.abortTransaction();
    }

    // Benutzerfreundliche Fehlermeldung zurückgeben
    return {
      success: false,
      message: error.message || 'Bei der Verarbeitung Ihrer Bestellung ist ein Fehler aufgetreten.'
    };

  } finally {
    // Session immer beenden, wenn sie existiert
    if (session) {
      await session.endSession();
    }
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

async function saveOrderAccount(orderDetails, orderId, session,isBut) {

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
      ],
      isBut: isBut,
      dateOrder:orderDetails.dateOrder,
      idType:orderDetails.orderAccount[0].idType,
      groupId:orderDetails.groupId

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
    totalPrice: getTotalPrice(req.body),
    groupId:req.body.groupId
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
    let result;
    if(req.body.isBut) {
      result = await addOrderBut(req);
    }else{
       result = await addOrder(req);
    }

    res.json(result); // Successful response
  } catch (error) {
    console.error("Error placing order:", error);
    const statusCode = error.status || 500; // Use the status from the error, default to 500
    res.status(statusCode).json({ success: false, message: error.message });
  }
};


module.exports.addOrder = addOrder

