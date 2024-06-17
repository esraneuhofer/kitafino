const mongoose = require("mongoose");
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const {saveSessionInfo,handleDatabaseError} = require('../controllers/stripe-session.controller');

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
    const { username, userId, isPwa, isIos, isAndroid } = req.body;
    console.log("username:", req.body);
    console.log("isPWA:", isPwa);
    console.log("isIos:", isIos);
    console.log("isAndroid:", isAndroid);

    let successUrl;
    let cancelUrl;

    if (isIos) {
      successUrl = 'your-ios-app://home/account_overview?status=success';
      cancelUrl = 'your-ios-app://home/account_overview?status=failure';
    } else if (isAndroid) {
      successUrl = 'your-android-app://home/account_overview?status=success';
      cancelUrl = 'your-android-app://home/account_overview?status=failure';
    } else {
      successUrl = process.env.NODE_ENV === 'production'
        ? 'https://kitafino-45139aec3e10.herokuapp.com/home/account_overview?status=success'
        : 'http://localhost:4200/home/account_overview?status=success';
      cancelUrl = process.env.NODE_ENV === 'production'
        ? 'https://kitafino-45139aec3e10.herokuapp.com/account_overview?status=failure'
        : 'http://localhost:4200/home/account_overview?status=failure';
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'paypal', 'giropay'],
      line_items: setLineItems(req.body),
      mode: 'payment',
      locale: 'de',
      payment_intent_data: {
        metadata: { userId: userId, username: username }
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
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
