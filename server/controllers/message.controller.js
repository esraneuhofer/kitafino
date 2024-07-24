const cron = require('node-cron');
const mongoose = require("mongoose");
const Message = mongoose.model('MessageSchema');

// Funktion zum Abrufen von Nachrichten
module.exports.getMessages = async (req, res, next) => {
  console.log('req.tenantId', req.tenantId);
    try {
        const messages = await Message.find({ 'tenantId': req.tenantId });
        res.json(messages);
    } catch (err) {
        console.error('Error getting Messages', err);
        res.status(500).send({ message: 'Internal Server Error' });
    }
};

// Funktion zum Bearbeiten einer Nachricht
module.exports.editMessage = (req, res, next) => {
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

// Funktion zum Hinzufügen einer Nachricht
module.exports.addMessage = (req, res, next) => {
    let newModel = new Message({
        message: req.body.message,
        heading: req.body.heading,
        messageSeen: [],
        createdAt: new Date(),
        sentBy: req.body.sentBy,
        customerId: req.customerId,
        tenantId: req.tenantId,
    });

    newModel.save().then(data => {
        res.json({ student: data, error: false });
    }).catch(e => {
        res.json({ student: e, error: true });
    });
};

// Funktion zum Planen des Cron-Jobs zum Löschen alter Nachrichten
const scheduleDeleteOldMessages = () => {
  cron.schedule('0 0 * * *', async () => {
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    try {
      await Message.deleteMany({
        $or: [
          { validTill: { $lt: new Date() } },
          { createdAt: { $lt: tenDaysAgo } }
        ]
      });
      console.log('Deleted messages older than 10 days or past validTill date');
    } catch (error) {
      console.error('Error deleting old messages:', error);
    }
  });
};


// Exportiere alle Funktionen, einschließlich des Cron-Jobs
module.exports = {
    getMessages: module.exports.getMessages,
    editMessage: module.exports.editMessage,
    addMessage: module.exports.addMessage,
    scheduleDeleteOldMessages
};
