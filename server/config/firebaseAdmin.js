// config/firebaseAdmin.js
const admin = require('firebase-admin');
require('dotenv').config(); // Ensure dotenv is installed and .env is configured

// Check if the environment variable exists
if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
  console.error('Service account key is not defined in environment variables.');
  process.exit(1); // Exit the application if the key is missing
}

// Parse the service account JSON from the environment variable
const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // Optional: If using Firestore or Realtime Database
  // databaseURL: 'https://<your-database-name>.firebaseio.com'
});

console.log('Firebase Admin SDK initialized successfully.');

module.exports = admin;
