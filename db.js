const mongoose = require('mongoose');
const uri = process.env.MONGO_URI;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');

    // Hier kannst du deine Initialisierungsaufgaben oder Cron-Jobs planen
    try {
      // Fiktive req und res Objekte für den Funktionsaufruf
      const req = {}; // Füge notwendige req Eigenschaften hinzu
      const res = {
        status: (statusCode) => ({
          send: (message) => console.log(`Response: ${statusCode}, Message:`, message)
        })
      };

      // Beispielhafte Aufgaben, die nach der Verbindung ausgeführt werden
      // await testing(req, res);
      // await testingDaily(req, res);
      // scheduleDeleteOldMessages();
      // await setTaskCustomerDeadline();
      console.log('Tasks scheduled successfully.');
    } catch (error) {
      console.error('Failed to execute tasks:', error);
    }
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
  });

module.exports = { conn };
