const mongoose = require("mongoose");
const stripe = require('stripe')('sk_test_51MhCdsHY2mPrPTHEZxMopIulzhGZdgDzOLMcPg9e3Ni7ZRRP0JVDAAp7BbXcGwFdOlQMSTlDF9MIYG3t5MmRmSSF00Edwvtng7');
const express = require('express');
const app = express();
// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = "whsec_f0d3484b13e96c272f7f2d228444c2a45106cefa8d0a19fbd231318fd62b709a";
const {addAccountChargesTenantStripe} = require('../controllers/stripe-proccess-account-controller');
exports.webhook_stripe = async (request, response) => {
  const sig = request.headers['stripe-signature'];
  try {
    const event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    switch (event.type) {
      case 'checkout.session.completed':
        const checkoutSessionCompleted = event.data.object;
        // Handle checkout.session.completed event
        break;
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object; // This is the PaymentIntent object
        console.log('PaymentIntent was successful!', paymentIntent);
        const data = {
          paymentAmount: paymentIntent.amount, // Stripe amounts are in cents
          username: paymentIntent.metadata.username, // Assuming you store username in metadata when creating the PaymentIntent
          userId: paymentIntent.metadata.userId // Assuming you store username in metadata when creating the PaymentIntent
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
    response.send({ received: true });
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    response.status(400).send(`Webhook Error: ${err.message}`);
  }
};


