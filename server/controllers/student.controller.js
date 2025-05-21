const mongoose = require("mongoose");
const Student = mongoose.model('StudentNew');
const { logUserAction, getChangeStudent } = require('./action_log.controller');


module.exports.addStudent = (req, res, next) => {
  // Ensure that firstname and lastname are present in req.body
  if (!req.body.firstName || !req.body.lastName) {
    return res.json({ error: true, message: 'Both firstname and lastname must be provided.' });
  }

  let newModel = new Student({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    subgroup: req.body.subgroup,
    specialFood: req.body.specialFood,
    // Set other properties as needed
    schoolId: req.project_id,
    userId: req._id,
    customerId: req.customerId,
    tenantId: req.tenantId,
  });

  newModel.save().then(function (data) {
    res.json({ student: data, error: false });
      // Logging NACH dem Senden der Antwort
    logUserAction(
      req._id,                          // userId
      req.tenantId,                     // tenantId
      'KIND_ANMELDEN',         // actionType
     getChangeStudent(data) // Hilfsfunktion, die Änderungen ermittelt
    ).catch(err => {
      // Stille Fehlerbehandlung - beeinflusst den Hauptprozess nicht
        console.error('Fehler beim Logging der Kindesanlegung:', err);
    });


  }, function (e) {
    res.json({ student: e, error: true });
  });
}

module.exports.editStudent = (req, res, next) => {
  Student.findOneAndUpdate(
    { '_id': req.body._id },
    req.body,
    { upsert: true, new: true }
  ).then(doc => {
    res.send(doc);
    logUserAction(
      req._id,                          // userId
      req.tenantId,                     // tenantId
      'KIND_AENDERN',                   // actionTypeType
     getChangeStudent(doc) // Hilfsfunktion, die Änderungen ermittelt
    ).catch(err => {
      // Stille Fehlerbehandlung - beeinflusst den Hauptprozess nicht
      console.error('Fehler beim Logging der Kindesdatenänderung:', err);
    });
  }).catch(err => {
    return res.status(500).send({ error: err });
  });
};




module.exports.getRegisteredStudentsUser = async (req, res, next) => {
  try {
    // Using await to wait for the result of Tenant.find()
    const allStudents = await Student.find({ 'userId': req._id, isActive: true });

    // Sending the result back to the client
    res.json(allStudents);
  } catch (err) {
    // If an error occurs, log it and send an error response
    console.error(err); // Log the error for debugging
    res.status(500).send({ message: 'Internal Server Error' });
  }
};
