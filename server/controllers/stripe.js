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
    const { username, userId, isIos, isAndroid, amountPayment } = req.body;

    // const successUrl = process.env.NODE_ENV === 'production'
    //   ? isIos || isAndroid
    //     ? `https://essen.cateringexpert.de/success_stripe?status=success&amount=${amountPayment}`
    //     : `https://essen.cateringexpert.de/home/account_overview?status=success&amount=${amountPayment}`
    //   : isIos || isAndroid
    //     ? `http://localhost:4200/success_stripe?status=success&amount=${amountPayment}`
    //     : `http://localhost:4200/home/account_overview?status=success&amount=${amountPayment}`;
    //
    // const cancelUrl = process.env.NODE_ENV === 'production'
    //   ? isIos || isAndroid
    //     ? `https://essen.cateringexpert.de/error_stripe?status=failure&amount=${amountPayment}`
    //     : `https://essen.cateringexpert.de/home/account_overview?status=failure&amount=${amountPayment}`
    //   : isIos || isAndroid
    //     ? `http://localhost:4200/error_stripe?status=failure&amount=${amountPayment}`
    //     : `http://localhost:4200/home/account_overview?status=failure&amount=${amountPayment}`;

    // Definiere die Web-URLs, die als Universal/App Links fungieren
    const successUrl = process.env.NODE_ENV === 'production'
      // ? `https://essen.cateringexpert.de/home/account_overview?status=success&amount=${amountPayment}`
        ? `https://essen.cateringexpert.de/login`
      : `http://localhost:4200/home/account_overview?status=success&amount=${amountPayment}`;

    const cancelUrl = process.env.NODE_ENV === 'production'
      ? `https://essen.cateringexpert.de/home/account_overview?status=failure&amount=${amountPayment}`
      : `http://localhost:4200/home/account_overview?status=failure&amount=${amountPayment}`;


    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'paypal'],
      line_items: setLineItems(req.body),
      mode: 'payment',
      locale: 'de',
      payment_intent_data: {
        metadata: {
          userId: userId,
          username: username,
          amount: amountPayment
        }
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






