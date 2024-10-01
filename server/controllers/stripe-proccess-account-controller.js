const mongoose = require("mongoose");
const AccountSchema = mongoose.model('AccountSchema');
const ChargeAccount = mongoose.model('ChargeAccount');
const {getEmailChargeAccount} = require("./email-charge-account");
const {convertToSendGridFormat} = require("./sendfrid.controller");
const sgMail = require("@sendgrid/mail");
const TenantParent = mongoose.model('Tenantparent');


//
// exports.addAccountChargesTenant = async (req, res) => {
//   try {
//     if (session.payment_status === 'paid') {
//       // Begin transaction and account charges logic
//       const result = await addAccountChargesTenant(req, res);
//       res.json(result);
//     } else {
//       res.status(402).send({ error: 'Payment required' });
//     }
//   } catch (err) {
//     res.status(500).send({ error: err.message });
//   }
// };
async function addAccountChargesTenantStripe(data, session) {
  let paymentAmount = data.paymentAmount / 100; // Stripe amounts are in cents
  let username = data.username;
  let userId = data.userId;
  let paymentProvider = data.paymentProvider;
  let transactionId = data.transactionId;

  // Set the fee structure based on the payment provider
  let feePercentage = 0;
  let fixedFee = 0;

  // Puffer von 0,1 % hinzufügen
  const buffer = 0.3 / 100;

  switch (paymentProvider) {
    case 'paypal':
      feePercentage = (3.49 / 100); // Ergibt 3,59 %
      fixedFee = 0.49;
      break;
    case 'card':
      feePercentage = (1.4 / 100) + buffer; // Ergibt 1,5 %
      fixedFee = 0.25;
      break;
    case 'amex':
      feePercentage = (2.5 / 100) + buffer; // Ergibt 2,6 %
      fixedFee = 0.25;
      break;
    case 'google_pay':
      feePercentage = (1.4 / 100) + buffer; // Ergibt 1,5 %
      fixedFee = 0.25;
      break;
    case 'apple_pay':
      feePercentage = (1.4 / 100) + buffer; // Ergibt 1,5 %
      fixedFee = 0.25;
      break;
    default:
      throw new Error(`Unsupported payment provider: ${paymentProvider}`);
  }

  // Calculate the net amount after deducting fees
  const fee = paymentAmount * feePercentage + fixedFee;
  const netAmount = paymentAmount - fee - 0.02;

  try {
    await session.startTransaction();
    const account = await getAccountTenant(userId, session);

    if (!account) {
      throw new Error('Account not found');
    }
    const tenant = await getTenantInformation(userId, session);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    await saveAccount(account, netAmount, session);
    await addAccountCharge(account, username, netAmount, session, transactionId);

    await session.commitTransaction();

    // E-Mail-Optionen vorbereiten
    const mailOptions = getMailOptions(netAmount, username, new Date(), fee, tenant.email,transactionId);

    // E-Mail-Versand außerhalb der Transaktion
    try {
      await sgMail.send(convertToSendGridFormat(mailOptions));
      console.log('E-Mail erfolgreich gesendet.');
    } catch (emailError) {
      console.error('Fehler beim Senden der E-Mail:', emailError);
      // Optional: Weitere Fehlerbehandlung, z.B. Benachrichtigung eines Administrators
    }

    return { success: true, message: 'Charge added successfully' };

  } catch (error) {
    console.error('Error adding account charges:', error);
    await session.abortTransaction();
    throw new Error(error.message);
  } finally {
    session.endSession();
  }
}


async function getAccountTenant(userId, session) {
  try {
    // Using the session for a transaction context
    const account = await AccountSchema.findOne({ userId: userId }).session(session);
    return account; // Return the account object for further processing
  } catch (error) {
    console.error("Error getting account:", error);
    throw error; // Throw the error to be handled by the caller
  }
}

async function getTenantInformation(userId, session) {
  try {
    // Using the session for a transaction context
    const tenant = await TenantParent.findOne({ userId: userId }).session(session);
    return tenant; // Return the account object for further processing
  } catch (error) {
    console.error("Error getting tenant:", error);
    throw error; // Throw the error to be handled by the caller
  }
}

async function saveAccount(account, balanceToAdd, session) {
  try {
    account.currentBalance += balanceToAdd;  // Adjust balance
    await account.save({ session });  // Save the account within the transaction session
    return account;  // Return the updated account object
  } catch (error) {
    console.error('Error saving the account:', error);
    // Handle different types of errors that could occur during database operations
    handleDatabaseError(error, 'Error saving the account');
    throw error;  // Rethrow the error after handling it (e.g., logging)
  }
}


async function addAccountCharge(account, username, balanceToAdd, session,transactionId) {
  try {
    const newChargeAccount = new ChargeAccount({
      approved: true,
      username: username,
      reference: 'username',
      dateApproved: new Date(),
      amount: balanceToAdd,
      datePaymentReceived: new Date(),
      accountHolder: account.accountHolder,
      iban: 'stripe',
      paymentMethod: 'stripe',
      typeCharge: 'einzahlung',
      tenantId: account.tenantId,
      userId: account.userId,
      customerId: account.customerId,
      transactionId:transactionId
    });

    await newChargeAccount.save({ session });
    return newChargeAccount; // Return the newly created charge account object
  } catch (error) {
    console.error('Error saving the account charge:', error);
    throw await handleDatabaseError(error, 'Error saving the account charge');
    // Rethrowing the error here is important to ensure the caller is aware an error occurred
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

function getMailOptions (amount,username,paymentDate,fee,emailTenant,transactionId) {
  return {
    from: '"Cateringexpert" <noreply@cateringexpert.de>',
    bcc:'eltern_bestellung@cateringexpert.de',
    to: emailTenant, // This should be dynamically set based on the tenant's email
    subject: 'Kontoaktivität',
    html: getEmailChargeAccount(amount,username,paymentDate,fee,transactionId)
  };
}


module.exports = {
  addAccountChargesTenantStripe
}
