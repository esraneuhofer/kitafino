require('dotenv').config();
const sgMail = require('@sendgrid/mail')
const mongoose = require("mongoose");

const Tenantparent = mongoose.model('Tenantparent');
const AccountSchema = mongoose.model('AccountSchema');
const ChargeAccount = mongoose.model('ChargeAccount');
const {getEmailChargeAccount} = require('./email-charge-account');
const {getEmailWithdrawAccount} =  require('./email-withdraw-account');


sgMail.setApiKey(process.env.SENDGRID_API_KEY)

function getMailOptions (amount, req,tenantAccount) {
  return {
    from: '"Cateringexpert" <noreply@cateringexpert.de>',
    replyTo: 'noreply@cateringexpert.de', // This should be dynamically set based on the tenant's email
    bcc:'eltern_bestellung@cateringexpert.de',
    to: req.body.emailTenant, // This should be dynamically set based on the tenant's email
    subject: 'Kontoaktivität',
    html: getEmailTextCharge(req.body.amount, req.body.typeCharge,tenantAccount)
  };
}
function getAmountAddRemove(type, amount) {
  return type === 'charge' ? amount : -amount;
}
function getEmailTextCharge(amount, type, tenant) {
  if(type === 'charge') {
    return getEmailChargeAccount(amount, tenant.username);
    // return `Ihrem Konto wurden ${amount}€ gutgeschrieben. Ihr aktueller Kontostand beträgt ${currentBalance}€.`
  }
  return getEmailWithdrawAccount(amount,tenant);
  // return `Ihrem Konto wurden ${amount}€ abgebucht. Ihr aktueller Kontostand beträgt ${currentBalance}€.`
}


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


module.exports.addAccountChargesTenant = async (req, res) => {
  const session = await mongoose.startSession();
  await session.startTransaction();

  try {
    const accountCharge = await saveAccountCharge(req, session);
    await accountCharge.save({ session });
    const userId = req.body.userId;
    const account = await AccountSchema.findOne({ userId }).session(session);
    const tenantAccount = await Tenantparent.findOne({ userId }).session(session);
    const amountAddRemove = getAmountAddRemove(req.body.typeCharge, req.body.amount); // Assuming this correctly computes the amount to add or remove
    account.currentBalance += amountAddRemove;

    // Check if currentBalance would be negative
    if (account.currentBalance < 0) {
      // Rollback the transaction
      await session.abortTransaction();

      // Return an error response
      return res.status(400).json({ success: false, message: 'Operation abgelehnt. Kontostand würde negativ.' });
    }

    await account.save({ session });
    await session.commitTransaction();

    // Define your mailOptions based on the operation's result, customize as needed
    const mailOptions = getMailOptions(account.currentBalance, req, tenantAccount); // Ensure this function generates the correct mail options

    // Send an email notification about the account charge update
    sgMail.send(mailOptions)
      .then(() => {
        console.log('Email sent successfully');
      })
      .catch((error) => {
        console.error(error);
      });

    res.json({ success: true, message: 'Account erfolgreich geändert' });

  } catch (error) {
    console.log(error);
    await handleTransactionError(session, error, res);
  } finally {
    session.endSession();
  }
};


async function saveAccountCharge(req, session) {
  let newAccountCharge = new ChargeAccount({
    approved: req.body.approved,
    amount: req.body.amount,
    date: req.body.date,
    accountHolder: req.body.accountHolder,
    iban: req.body.iban,
    reference: req.body.reference,
    typeCharge: req.body.typeCharge,
    transactionId: req.body.transactionId,
    userId: req._id,
    customerId: req.customerId,
    tenantId: req.tenantId,
  });

  await newAccountCharge.save({ session });
  return newAccountCharge; // Return the saved object
}

async function handleTransactionError(session, error, res) {
  if (session.inTransaction()) {
    await session.abortTransaction();
  }
  res.json({ success: false, message: 'Failed to place order', error: error.message });

}

