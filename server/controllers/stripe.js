const mongoose = require("mongoose");
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const AccountSchema = mongoose.model('AccountSchema');
const ChargeAccount = mongoose.model('ChargeAccount');

function setLineItems(body){
  let amountEdited = body.amountPayment * 100
  return [{
    price_data: {
      currency: 'eur',
      product_data: {
        name: `Einzahlung für User: ${body.username}`,
      },
      unit_amount: amountEdited,  // This represents €20.00
    },
    quantity: 1,
  }]
}
exports.createPaymentIntent = async (req, res) => {
  try {
    // First, create the session without specifying the success_url or cancel_url
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: setLineItems(req.body),
      mode: 'payment',
      locale: 'de',  // Setzen Sie die Sprache auf Deutsch
      success_url: 'http://localhost:4200/success-placeholder',
      cancel_url: 'http://localhost:4200/cancel-placeholder',
    });
    // Return the session ID as needed
    res.json({id: session.id});
  } catch (err) {
    console.error("ErroR",err);
    res.status(500).send({error: err.message});
  }
};


exports.addAccountChargesTenant = async (req, res) => {
  console.log(req.params.sessionId)
  const sessionId = req.params.sessionId;  // Retrieve sessionId from URL parameter
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log(session)
    if (session.payment_status === 'paid') {
      // Begin transaction and account charges logic
      const result = await addAccountChargesTenant(req, res);
      res.json(result);
    } else {
      res.status(402).send({ error: 'Payment required' });
    }
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};
async function addAccountChargesTenant(req, res) {
  const session = await mongoose.startSession();
  let paymentAmount = req.body.paymentAmount;
  let username = req.body.userName;
  try {
    await session.startTransaction();
    const account = getAccountTenant(req,session);
    await saveAccount(account, paymentAmount, session);
    await addAccountCharge(account,req.body.userName, paymentAmount, session);
    await session.commitTransaction();

    return { success: true, message: 'Order placed successfully' };
  } catch (error) {
    await session.abortTransaction();
    // Forward the error from saveNewOrder
    throw new Error(error.message);
  } finally {
    session.endSession();
  }
}

async function getAccountTenant(req,session) {
  try {
    const account = await AccountSchema.findOne(req);
    res.json(account); // Successful response
  }catch (error) {
    console.error("Error getting account:", error);
    const statusCode = error.status || 500; // Use the status from the error, default to 500
    res.status(statusCode).json({ success: false, message: error.message });
  }
}
async function saveAccount(account, balanceToAdd, session) {
  try {
    account.currentBalance += balanceToAdd;
    await account.save({ session });
  } catch (error) {
    // Handle different types of errors that could occur during database operations
    handleDatabaseError(error, 'Error saving the order account');
  }
}

async function addAccountCharge(account,username, balanceToAdd, session) {
  try {
    const newChargeAccount = new ChargeAccount({
      approved: true,
      amount: balanceToAdd,
      date: new Date(),
      paymentMethod: 'stripe',
      iban: null,
      reference: username,
      typeCharge: 'deposit',
      tenantId: account.tenantId,
      userId: account.userId,
      customerId: account.customerId
    });
    await newChargeAccount.save({ session });
  } catch (error) {
    // Handle different types of errors that could occur during database operations
    handleDatabaseError(error, 'Error saving the account charge');
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
