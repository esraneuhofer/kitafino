const mongoose = require("mongoose");

// const admin = require('../config/firebaseAdmin');
const User = mongoose.model('Schooluser');

async function saveTokenFirebase(req, res, next) {
  const { token } = req.body;

  if (!token) {
    return res.status(400).send({ message: 'Token is required' });
  }

  try {
    // Finde den Benutzer und füge das Token nur hinzu, wenn es noch nicht im Array vorhanden ist
    const user = await User.findOneAndUpdate(
      { _id: req._id },
      { $addToSet: { token: token } },  // Fügt das Token nur hinzu, wenn es nicht bereits im Array vorhanden ist
      { upsert: true, new: true }
    );

    console.log('Token saved successfully:', token);
    res.status(200).send({ message: 'Token saved successfully' });
  } catch (error) {
    console.error('Fehler beim Speichern des Tokens:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
}

async function deleteAllTokensFirebase(req, res, next) {
  console.log("sss")
  try {
    // Setze das token-Feld auf ein leeres Array
    const user = await User.findOneAndUpdate(
      { _id: req._id },
      { $set: { token: [] } },  // Setzt das token-Feld auf ein leeres Array
      { new: true }
    );

    console.log('All tokens deleted successfully.');
    res.status(200).send({ message: 'All tokens deleted successfully' });
  } catch (error) {
    console.error('Fehler beim Löschen der Tokens:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
}


// dvvbjXX7Zk2Oq1n5P0VXwz:APA91bELBzRPlX1g-HU6kddmqowocovNyRUswtVJt05_U8dJ8unv1hIZmgStEuKvaUe3Q1KjPJlLbOR4T1W1dah2t8nLNj5cKiSYJgMpgl8d_76vzeDkuEL4AfHoB3Wu2fYpqYQLJFc6

module.exports = {
  deleteAllTokensFirebase,
  saveTokenFirebase
};
