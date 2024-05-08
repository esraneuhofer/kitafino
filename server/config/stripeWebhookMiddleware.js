// stripeWebhookMiddleware.js
const bodyParser = require('body-parser');

// Middleware to handle raw bodies for webhooks
const rawBodyBuffer = bodyParser.raw({ type: 'application/json' });

module.exports = {
  rawBodyBuffer
};
