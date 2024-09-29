const mongoose = require("mongoose");

const admin = require('../config/firebaseAdmin');
const User = mongoose.model('Schooluser');

/**
 * Funktion zum Senden einer Push-Benachrichtigung an alle Benutzer
 */
async function sendPushNotification() {
  try {
    const users = await User.find({token: {$exists: true, $ne: ''}});

    if (users.length === 0) {
      console.log('Keine Geräte-Tokens gefunden');
      return;
    }

    const tokens = users.map(user => user.token);
    console.log(tokens, 'Geräte-Tokens gefunden');
    const message = {
      notification: {
        title: 'Bestellungs-Erinnerung',
        body: 'Bitte bestellen Sie noch Ihr Essen',
      },
      tokens: tokens,
      android: {
        notification: {
          channel_id: 'cateringexpert_channel_id', // Stellen Sie sicher, dass dieser Channel existiert
        },
      },
      apns: {
        payload: {
          aps: {
            alert: {
              title: 'Bestellungs-Erinnerung',
              body: 'Bitte bestellen Sie noch Ihr Essen',
            },
            sound: 'default',
            badge: 1,
          },
        },
        headers: {
          'apns-priority': '10',
          'apns-push-type': 'alert',
        },
      },
    };



    const response = await admin.messaging().sendEachForMulticast(message);
    console.log('Push-Benachrichtigungen gesendet:', response.successCount, 'Erfolge');

    if (response.failureCount > 0) {
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(tokens[idx]);
          console.error('Fehlgeschlagener Token:', tokens[idx], resp.error);
        }
      });
      // Optional: Entfernen Sie fehlgeschlagene Tokens aus der Datenbank
      // await User.updateMany({ token: { $in: failedTokens } }, { $unset: { token: "" } });
    }
  } catch (error) {
    console.error('Fehler beim Senden der Push-Benachrichtigungen:', error);
  }
}


async function saveTokenFirebase(req, res, next) {
  const {token} = req.body;
  console.log('Token:', token);
  if (!token) {
    return res.status(400).send({message: 'Token is required'});
  }

  try {

    const user = await User.findOneAndUpdate({_id:req._id}, {token}, {upsert: true, new: true});


    res.status(200).send({message: 'Token saved successfully'});
  } catch (error) {
    console.error('Fehler beim Speichern des Tokens:', error);
    res.status(500).send({message: 'Internal Server Error'});
  }
};



module.exports = {
  sendPushNotification,
  saveTokenFirebase
};
