const mongoose = require("mongoose");
const PermanentOrderStudent = mongoose.model("PermanentOrderStudent");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const {
  logUserAction,
  getChangePermanentOrder,
} = require("./action_log.controller");

module.exports.getPermanentOrdersUser = async (req, res, next) => {
  console.log(req._id);
  try {
    // Using await to wait for the result of Tenant.find()
    const allPermanentOrders = await PermanentOrderStudent.find({
      userId: req._id,
    });

    // Sending the result back to the client
    res.json(allPermanentOrders);
  } catch (err) {
    // If an error occurs, log it and send an error response
    console.error("Error getTenant", err); // Log the error for debugging
    res.status(500).send({ message: "Internal Server Error" });
  }
};

module.exports.editPermanentOrdersUser = (req, res, next) => {
  PermanentOrderStudent.findOneAndUpdate({ _id: req.body._id }, req.body, {
    upsert: true,
    new: true,
  })
    .then((doc) => {
      res.json({ error: false, errorType: null, data: doc });

      // Logging NACH dem Senden der Antwort
      logUserAction(
        req._id, // userId
        req.tenantId, // tenantId
        "DAUERBESTELLUNG_AENDERN",
        getChangePermanentOrder(doc) // actionType
      ).catch((err) => {
        // Stille Fehlerbehandlung - beeinflusst den Hauptprozess nicht
        console.error("Fehler beim Logging der Dauerbestellungsänderung:", err);
      });
    })
    .catch((err) => {
      res.json({ error: true, errorType: err, data: null });
    });
};

module.exports.setPermanentOrdersUser = async (req, res, next) => {
  try {
    let newPermanentOrder = new PermanentOrderStudent({
      tenantId: req.tenantId,
      customerId: req.customerId,
      userId: req._id,
      isSpecial: req.body.isSpecial,
      daysOrder: req.body.daysOrder,
      studentId: req.body.studentId,
    });

    let doc = await newPermanentOrder.save();

    // // E-Mail mit den wichtigsten Daten senden
    // const msg = {
    //   from: '"Cateringexpert" <noreply@cateringexpert.de>',
    //   to: 'monitoring@cateringexpert.de',
    //   subject: 'Neue Dauerbestellung erstellt',
    //   html: `
    //     <h2>Neue Dauerbestellung wurde erstellt</h2>
    //     <p><strong>Kunden-ID:</strong> ${doc.customerId}</p>
    //     <p><strong>Student-ID:</strong> ${doc.studentId}</p>
    //     <p><strong>Besondere Bestellung:</strong> ${doc.isSpecial ? 'Ja' : 'Nein'}</p>
    //     <p><strong>Bestellte Tage:</strong> ${doc.daysOrder.join(', ')}</p>
    //   `,
    // };

    // await sgMail.send(msg);

    res.json({
      error: false,
      errorType: null,
      data: doc,
      message: "Dauerbestellung gespeichert",
    });

    console.log("Permanent order created:", doc._id);
    // Logging NACH dem Senden der Antwort, damit es den Hauptprozess nicht blockiert
    logUserAction(
      req._id,
      req.tenantId,
      "DAUERBESTELLUNG_ERSTELLEN",
      getChangePermanentOrder(doc) // actionType
    ).catch((err) => {
      // Stille Fehlerbehandlung - beeinflusst den Hauptprozess nicht
      console.error("Fehler beim Logging der Dauerbestellung:", err);
    });
  } catch (error) {
    console.error("Fehler:", error);
    res.json({ error: true, errorType: error, data: null });
  }
};

module.exports.deletePermanentOrdersUser = async (req, res, next) => {
  try {
    // Erst die Dauerbestellung finden, um die Daten für das Logging zu erfassen
    const permanentOrderToDelete = await PermanentOrderStudent.findById(
      req.body._id
    );

    if (!permanentOrderToDelete) {
      return res
        .status(404)
        .json({ error: true, errorType: "No document found with that id" });
    }

    const result = await PermanentOrderStudent.deleteOne({ _id: req.body._id });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ error: true, errorType: "No document found with that id" });
    }

    res.json({ error: false, message: "Deletion successful", result: result });

    // Logging NACH dem Senden der Antwort, damit es den Hauptprozess nicht blockiert
    logUserAction(
      req._id, // userId
      req.tenantId, // tenantId
      "DAUERBESTELLUNG_LOESCHEN", // actionType
      getChangePermanentOrder(permanentOrderToDelete) // details der gelöschten Bestellung
    ).catch((err) => {
      // Stille Fehlerbehandlung - beeinflusst den Hauptprozess nicht
      console.error("Fehler beim Logging der Dauerbestellungslöschung:", err);
    });
  } catch (err) {
    res.status(500).json({ error: true, errorType: err.message });
  }
};
