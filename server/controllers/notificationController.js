const mongoose = require("mongoose");

// const admin = require('../config/firebaseAdmin');
const User = mongoose.model('Schooluser');

async function saveTokenFirebase(req, res, next) {
  const {token} = req.body;

  if (!token) {
    return res.status(400).send({message: 'Token is required'});
  }

  try {
    const user = await User.findOneAndUpdate({_id:req._id}, {token}, {upsert: true, new: true});
    console.log('Token saved successfully:', token);
    res.status(200).send({message: 'Token saved successfully'});
    console.log('Token saved successfully:', token);
  } catch (error) {
    console.error('Fehler beim Speichern des Tokens:', error);
    res.status(500).send({message: 'Internal Server Error'});
  }
};



module.exports = {
  // sendPushNotification,
  saveTokenFirebase
};
