const mongoose = require("mongoose");
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const {retrieveSessionInfo, saveSessionInfo,handleDatabaseError} = require('../controllers/stripe-session.controller');

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
    // Assuming you receive username as part of the request body or derive it from session/user information
    const { username, userId } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: setLineItems(req.body),
      mode: 'payment',
      locale: 'de',  // Set the language to German
      metadata: { userId:userId,username:username },  // Include metadata in the session
      success_url: 'http://localhost:4200/home/account_overview',
      cancel_url: 'http://localhost:4200/cancel-placeholder',
    });

    try {
      await saveSessionInfo(session.id, userId, username);
    } catch (error) {
      const errDetails = handleDatabaseError(error);
      res.status(errDetails.status).send({ error: errDetails.message });
      return;  // Stop further execution in case of error
    }

    res.json({id: session.id});
  } catch (err) {
    console.error("Error", err);
    res.status(500).send({error: err.message});
  }
};


