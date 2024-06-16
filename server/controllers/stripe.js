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
    const { username, userId, isPwa } = req.body;
    console.log("username:", req.body);
    console.log("isPWA:", isPwa);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'paypal', 'giropay'],
      line_items: setLineItems(req.body),
      mode: 'payment',
      locale: 'de',
      payment_intent_data: {
        metadata: { userId: userId, username: username }
      },
      success_url: process.env.NODE_ENV === 'production'
        ? 'https://kitafino-45139aec3e10.herokuapp.com/home/account_overview?status=success'
        : 'http://localhost:4200/home/account_overview?status=success',
      cancel_url: process.env.NODE_ENV === 'production'
        ? 'https://kitafino-45139aec3e10.herokuapp.com/account_overview?status=failure'
        : 'http://localhost:4200/home/account_overview?status=failure',
    });

    try {
      await saveSessionInfo(session.id, userId, username);
    } catch (error) {
      const errDetails = handleDatabaseError(error);
      res.status(errDetails.status).send({ error: errDetails.message });
      return;
    }

    res.json({ id: session.id });
  } catch (err) {
    console.error("Error", err);
    res.status(500).send({ error: err.message });
  }
};




