const mongoose = require("mongoose");
const PermanentOrderStudent = mongoose.model('PermanentOrderStudent');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports.getPermanentOrdersUser = async (req, res, next) => {
  console.log(req._id);
  try {

    // Using await to wait for the result of Tenant.find()
    const allPermanentOrders = await PermanentOrderStudent.find({ 'userId': req._id });

    // Sending the result back to the client
    res.json(allPermanentOrders);
  } catch (err) {
    // If an error occurs, log it and send an error response
    console.error('Error getTenant',err); // Log the error for debugging
    res.status(500).send({ message: 'Internal Server Error' });
  }
};

module.exports.editPermanentOrdersUser = (req, res, next) => {
  PermanentOrderStudent.findOneAndUpdate(
    { '_id': req.body._id },
    req.body,
    { upsert: true, new: true }
  ).then(doc => {
    res.json({error: false,errorType:null,data:doc });
  }).catch(err => {
    res.json({error: true,errorType:err,data:null });
  });
};

// module.exports.setPermanentOrdersUser = (req, res, next) => {
//
//   let newPermanentOrder = new PermanentOrderStudent({
//     tenantId : req.tenantId,
//     customerId : req.customerId,
//     userId : req._id,
//     isSpecial : req.body.isSpecial,
//     daysOrder : req.body.daysOrder,
//     studentId : req.body.studentId
//   });
//   newPermanentOrder.save().then(function (doc) {
//     res.json({error: false,errorType:null,data:doc });
//   }, function (e) {
//     res.json({error: true,errorType:e,data:null });
//   });
// };
module.exports.setPermanentOrdersUser = async (req, res, next) => {
  try {
    let newPermanentOrder = new PermanentOrderStudent({
      tenantId: req.tenantId,
      customerId: req.customerId,
      userId: req._id,
      isSpecial: req.body.isSpecial,
      daysOrder: req.body.daysOrder,
      studentId: req.body.studentId
    });

    let doc = await newPermanentOrder.save();

    // E-Mail mit den wichtigsten Daten senden
    const msg = {
      from: '"Cateringexpert" <noreply@cateringexpert.de>',
      to: 'monitoring@cateringexpert.de',
      subject: 'Neue Dauerbestellung erstellt',
      html: `
        <h2>Neue Dauerbestellung wurde erstellt</h2>
        <p><strong>Kunden-ID:</strong> ${doc.customerId}</p>
        <p><strong>Student-ID:</strong> ${doc.studentId}</p>
        <p><strong>Besondere Bestellung:</strong> ${doc.isSpecial ? 'Ja' : 'Nein'}</p>
        <p><strong>Bestellte Tage:</strong> ${doc.daysOrder.join(', ')}</p>
      `,
    };

    await sgMail.send(msg);

    res.json({ error: false, errorType: null, data: doc, message: 'Dauerbestellung gespeichert und E-Mail gesendet' });

  } catch (error) {
    console.error('Fehler:', error);
    res.json({ error: true, errorType: error, data: null });
  }
};


module.exports.deletePermanentOrdersUser = async (req, res, next) => {
  try {
    const result = await PermanentOrderStudent.deleteOne({ '_id': req.body._id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: true, errorType: 'No document found with that id' });
    }
    res.json({ error: false, message: 'Deletion successful', result: result });
  } catch (err) {
    res.status(500).json({ error: true, errorType: err.message });
  }
};
