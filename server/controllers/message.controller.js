

const mongoose = require("mongoose");
const Message = mongoose.model('MessageSchema');

module.exports.getMessages = async (req, res, next) => {
    try {
        // Using await to wait for the result of Tenant.find()
        const messages = await Message.find({ 'customerId': req.customerId });

        // Sending the result back to the client
        res.json(messages);
    } catch (err) {
        // If an error occurs, log it and send an error response
        console.error('Error getting Messages',err); // Log the error for debugging
        res.status(500).send({ message: 'Internal Server Error' });
    }
};

module.exports.editMessage = (req, res, next) => {
    Message.findOneAndUpdate(
        { '_id': req.body._id },
        req.body,
        { upsert: true, new: true }
    ).then(doc => {
        res.json({error: false,errorType:null,data:doc });
    }).catch(err => {
        res.json({error: true,errorType:err,data:null });
    });
};

module.exports.addMessage = (req, res, next) => {
    // Ensure that firstname and lastname are present in req.body

    let newModel = new Message({
        message: req.body.message,
        heading: req.body.heading,
        messageSeen: [],
        createdAt: new Date(),
        sentBy: req.body.sentBy,
        customerId: req.body.customerId,
        tenantId: req.body.tenantId,
    });

    newModel.save().then(function (data) {
        res.json({ student: data, error: false });
    }, function (e) {
        res.json({ student: e, error: true });
    });
}
