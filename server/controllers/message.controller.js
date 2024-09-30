const cron = require('node-cron');
const mongoose = require("mongoose");
const Message = mongoose.model('MessageSchema');

// Funktion zum Abrufen von Nachrichten
async function getMessages  (req, res, next)  {
  console.log('req.tenantId', req.tenantId);
    try {
        const messages = await Message.find({ 'customerId': req.customerId });
        res.json(messages);
    } catch (err) {
        console.error('Error getting Messages', err);
        res.status(500).send({ message: 'Internal Server Error' });
    }
};

async function editMessage  (req, res, next)  {
    Message.findOneAndUpdate(
        { '_id': req.body._id },
        req.body,
        { upsert: true, new: true }
    ).then(doc => {
        res.json({ error: false, errorType: null, data: doc });
    }).catch(err => {
        res.json({ error: true, errorType: err, data: null });
    });
};


// Funktion zum Planen des Cron-Jobs zum Löschen alter Nachrichten



// Exportiere alle Funktionen, einschließlich des Cron-Jobs
module.exports = {
    getMessages,
    editMessage,
};
