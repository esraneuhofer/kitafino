const mongoose = require("mongoose");
require('dotenv').config();
const secretKey = process.env.STRIPE_SECRET_KEY;
const stripe = require('stripe')(secretKey);
const express = require('express');
const app = express();
// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = "whsec_A7Yzl3wS7vNAc2edDd4jGOJWmHMzjEk7";
const {addAccountChargesTenantStripe} = require('../controllers/stripe-proccess-account-controller');
const {retrieveSessionInfo} = require('../controllers/stripe-session.controller');

exports.webhook_stripe = async (request, response) => {
  const sig = request.headers['stripe-signature'];
  console.log(request.body)
  try {

    const event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    console.log(event)
    switch (event.type) {
      case 'checkout.session.completed':
        // metadata.username = event.data.object.metadata.username;
        // metadata.userId = event.data.object.metadata.userId;
        // console.log("1",metadata)
        // Handle checkout.session.completed event
        break;
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object; // This is the PaymentIntent object
        const data = {
          paymentAmount: paymentIntent.amount, // Stripe amounts are in cents
          username: paymentIntent.metadata.username, // Assuming you store username in metadata when creating the PaymentIntent
          userId: paymentIntent.metadata.userId, // Assuming you store userId in metadata when creating the PaymentIntent
          paymentProvider: paymentIntent.payment_method_types[0] // The first element contains the payment method type (e.g., 'card', 'paypal')
        };
        // Start a new Mongoose session for transaction
        const session = await mongoose.startSession();
        try {
          const result = await addAccountChargesTenantStripe(data, session);
          console.log(result.message);
        } catch (error) {
          console.error('Error processing account charge:', error);
        }
        break;
      case 'payment_method.attached':
        const paymentMethodAttached = event.data.object;
        // Handle payment_method.attached event
        break;
      case 'payment_method.updated':
        const paymentMethodUpdated = event.data.object;
        // Handle payment_method.updated event
        break;
      case 'payment_method.detached':
        const paymentMethodDetached = event.data.object;
        // Handle payment_method.detached event
        break;
      case 'payout.created':
        const payoutCreated = event.data.object;
        // Handle payout.created event
        break;
      case 'payout.paid':
        const payoutPaid = event.data.object;
        // Handle payout.paid event
        break;
      case 'source.chargeable':
        const sourceChargeable = event.data.object;
        // Handle source.chargeable event
        break;

      case 'charge.updated':
        const sourceUpdated = event.data.object;
        // Handle source.failed event
        break;
      case 'source.failed':
        const sourceFailed = event.data.object;
        // Handle source.failed event
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    response.send({received: true});
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    response.status(400).send(`Webhook Error: ${err.message}`);
  }
};


