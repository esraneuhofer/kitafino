require('dotenv').config();
const sgMail = require('@sendgrid/mail')
const mongoose = require("mongoose");
const Tenantparent = mongoose.model('Tenantparent');
const WithdrawModel = mongoose.model('WithdrawRequest');
const AccountSchema = mongoose.model('AccountSchema');
const ChargeAccount = mongoose.model('ChargeAccount');
const {getMailOptions, getAmountAddRemove} = require('../controllers/charge-account-functions');
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

module.exports.getAccountTenant = async (req, res, next) => {
  try {
    const account = await AccountSchema.findOne({ 'userId': req._id });
    if (!account) {
      // Handle the case where no account is found
      return res.status(404).json({ message: 'Account wurde nicht gefunden, bitte wenden Sie sich an den Kundensupport' });
    }
    // Successfully found the account, implicitly sends 200 OK
    res.json(account);
  } catch (err) {
    console.error('Account konnte nicht gefunden werden:', err); // Log the error for debugging
    res.status(500).json({ message: 'Interner Serverfehler', error: err.message });
  }
};

module.exports.getAccountCharges = async (req, res, next) => {
  try {
    // Using await to wait for the result of Tenant.find()
    const account = await ChargeAccount.find({ 'userId': req._id });

    // Sending the result back to the client
    res.json(account);
  } catch (err) {
    // If an error occurs, log it and send an error response
    console.error(err); // Log the error for debugging
    res.status(500).send({ message: 'Internal Server Error' });
  }
};

// async function addAccountChargesTenant  (req, res) {
//   const session = await mongoose.startSession();
//   await session.startTransaction();
//
//   try {
//     let newAccountCharge = new ChargeAccount(req.body.accountCharge);
//     const accountCharge = await newAccountCharge.save({ session });
//
//     await accountCharge.save({ session });
//     const userId = req.body.accountCharge.userId;
//     const account = await AccountSchema.findOne({ userId }).session(session);
//     const tenantAccount = await Tenantparent.findOne({ userId }).session(session);
//     const amountAddRemove = getAmountAddRemove(req.body.accountCharge.typeCharge, req.body.accountCharge.amount); // Assuming this correctly computes the amount to add or remove
//     account.currentBalance += amountAddRemove;
//
//     // Check if currentBalance would be negative
//     if (account.currentBalance < 0) {
//       // Rollback the transaction
//       await session.abortTransaction();
//
//       // Return an error response
//       return res.status(400).json({ success: false, message: 'Operation abgelehnt. Kontostand würde negativ.' });
//     }
//
//     await account.save({ session });
//     await session.commitTransaction();
//
//     // Define your mailOptions based on the operation's result, customize as needed
//     const mailOptions = getMailOptions(req.body.accountCharge, req.body.tenant); // Ensure this function generates the correct mail options
//
//     // Send an email notification about the account charge update
//     sgMail.send(mailOptions)
//       .then(() => {
//         console.log('Email sent successfully');
//       })
//       .catch((error) => {
//         console.error(error);
//       });
//
//     res.json({ success: true, message: 'Account erfolgreich geändert' });
//
//   } catch (error) {
//     console.log(error);
//     await handleTransactionError(session, error, res);
//   } finally {
//     session.endSession();
//   }
// };

async function handleTransactionError(session, error, res) {
  if (session.inTransaction()) {
    await session.abortTransaction();
  }
  if (!res.headersSent) {
    if (error.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        message: 'Validierungsfehler',
        error: error.message
      });
    } else {
      res.status(500).json({ success: false, message: 'Failed to place order', error: error.message });
    }
  }
}



