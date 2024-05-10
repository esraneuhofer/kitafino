const mongoose = require("mongoose");
const SessionStripe = mongoose.model('SessionStripe');
async function saveSessionInfo(sessionId, userId, username) {
  try {
    const newSessionModel = new SessionStripe({
      sessionId,
      userId,
      username,
    });

    await newSessionModel.save();
    return newSessionModel;  // Return the newly created session model object
  } catch (error) {
    console.error('Error saving session information:', error);
    throw error;  // Rethrow the error to be caught by the caller
  }
}

async function retrieveSessionInfo(sessionId) {
  try {
    console.log('sessionId', sessionId)
    const sessionInfo = await SessionStripe.findOne({ sessionId });
    return sessionInfo;
  } catch (error) {
    console.error('Error retrieving the account charge:', error);
    throw await handleDatabaseError(error, 'Error retrieving the account charge');
    // Rethrowing the error here is important to ensure the caller is aware an error occurred
  }
}

function handleDatabaseError(error) {
  console.error("Database operation failed:", error);  // Log the detailed error
  let responseDetails = {
    status: 500,
    message: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'  // Default error message
  };

  if (error.name === 'ValidationError') {
    responseDetails.status = 400;
    responseDetails.message = 'Validierungsfehler. Bitte überprüfen Sie die eingegebenen Daten.';
  } else if (error.code === 11000) {
    responseDetails.status = 409;
    responseDetails.message = 'Konflikt: Dopplete Daten erkannt. Bitte überprüfen Sie Ihre Eingaben.';
  }

  return responseDetails;  // Return an object containing status and message
}

module.exports = {
  saveSessionInfo,
  retrieveSessionInfo,
  handleDatabaseError
}
