const mongoose = require("mongoose");
const AccountSchema = mongoose.model('AccountSchema');
const ChargeAccount = mongoose.model('ChargeAccount');

exports.addAccountChargesTenant = async (req, res) => {
  try {
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
async function addAccountChargesTenantStripe(data, session) {
  let paymentAmount = data.paymentAmount / 100; // Stripe amounts are in cents
  let username = data.username;
  let userId = data.userId;
  let paymentProvider = data.paymentProvider;

  // Set the fee structure based on the payment provider
  let feePercentage = 0;
  let fixedFee = 0;

  switch (paymentProvider) {
    case 'giropay':
      feePercentage = 1.3 / 100; // 1.2% + 0.1% Puffer
      fixedFee = 0.25;
      break;
    case 'paypal':
      feePercentage = 3.59 / 100; // 3.49% + 0.1% Puffer
      fixedFee = 0.49;
      break;
    case 'card':
      feePercentage = 1.5 / 100; // 1.4% + 0.1% Puffer
      fixedFee = 0.25;
      break;
    case 'amex':
      feePercentage = 2.6 / 100; // 2.5% + 0.1% Puffer
      fixedFee = 0.25;
      break;
    case 'google_pay':
      feePercentage = 1.5 / 100; // 1.4% + 0.1% Puffer
      fixedFee = 0.25;
      break;
    case 'apple_pay':
      feePercentage = 1.5 / 100; // 1.4% + 0.1% Puffer
      fixedFee = 0.25;
      break;
    default:
      throw new Error(`Unsupported payment provider: ${paymentProvider}`);
  }

  // Calculate the net amount after deducting fees
  const fee = paymentAmount * feePercentage + fixedFee;
  const netAmount = paymentAmount - fee;

  try {
    await session.startTransaction();
    const account = await getAccountTenant(userId, session);
    if (!account) {
      throw new Error('Account not found');
    }

    await saveAccount(account, netAmount, session);
    await addAccountCharge(account, username, netAmount, session);
    await session.commitTransaction();

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


async function addAccountCharge(account, username, balanceToAdd, session) {
  try {
    const newChargeAccount = new ChargeAccount({
      approved: true,
      dateApproved: new Date(),
      amount: balanceToAdd,
      date: new Date(),
      paymentMethod: 'stripe',
      iban: null,
      typeCharge: 'deposit',
      tenantId: account.tenantId,
      userId: account.userId,
      customerId: account.customerId
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

module.exports = {
  addAccountChargesTenantStripe
}
