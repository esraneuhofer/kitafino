// config/firebaseAdmin.js
const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config(); // Ensure dotenv is installed and .env is configured

// Path to your Service Account JSON file
const serviceAccountPath = path.resolve(__dirname, '../serviceAccountKey.json');

// Check if the service account file exists
const fs = require('fs');
if (!fs.existsSync(serviceAccountPath)) {
  console.error(`Service account key file not found at path: ${serviceAccountPath}`);
  process.exit(1); // Exit the application if the file is missing
}

// Load the service account key
const serviceAccount = require(serviceAccountPath);

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // Optional: If using Firestore or Realtime Database
  // databaseURL: 'https://<your-database-name>.firebaseio.com'
});

console.log('Firebase Admin SDK initialized successfully.');

module.exports = admin;
