const mongoose = require("mongoose");
const Student = mongoose.model('StudentNew');

module.exports.addStudent = (req, res, next) => {
  // Ensure that firstname and lastname are present in req.body
  if (!req.body.firstName || !req.body.lastName) {
    return res.json({ error: true, message: 'Both firstname and lastname must be provided.' });
  }

  let newModel = new Student({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    // Set other properties as needed
    schoolId: req.project_id,
    userId: req._id,
    customerId: req.customerId,
    tenantId: req.tenantId,
  });

  newModel.save().then(function (data) {
    res.json({ student: data, error: false });
  }, function (e) {
    res.json({ student: e, error: true });
  });
}



module.exports.getRegisteredStudentsUser = async (req, res, next) => {
  console.log(req._id);
  try {
    // Using await to wait for the result of Tenant.find()
    const allStudents = await Student.find({ 'userId': req._id });

    // Sending the result back to the client
    res.json(allStudents);
  } catch (err) {
    // If an error occurs, log it and send an error response
    console.error(err); // Log the error for debugging
    res.status(500).send({ message: 'Internal Server Error' });
  }
};
