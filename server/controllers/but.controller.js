const mongoose = require("mongoose");
const ButSchema = mongoose.model('ButSchema');
const ButDocument = mongoose.model('ButDocumentSchema');

module.exports.getButTenant = async (req, res, next) => {
  console.log(req._id);
  try {

    // Using await to wait for the result of Tenant.find()
    const allButCustomer = await ButSchema.find({ 'customerId': req.customerId });

    // Sending the result back to the client
    res.json(allButCustomer);
  } catch (err) {
    // If an error occurs, log it and send an error response
    console.error('Error getTenant',err); // Log the error for debugging
    res.status(500).send({ message: 'Internal Server Error' });
  }
};

module.exports.getSingleButDocument = async (req, res, next) => {
  console.log(req.query)
  console.log("req.query")
  try {

    // Using await to wait for the result of Tenant.find()
    const butStudent = await ButDocument.findOne({ '_id': req.query._id });

    // Sending the result back to the client
    res.json(butStudent);
  } catch (err) {
    // If an error occurs, log it and send an error response
    console.error('Error getTenant',err); // Log the error for debugging
    res.status(500).send({ message: 'Internal Server Error' });
  }
};

module.exports.addOrEditBut = (req, res, next) => {
  // PermanentOrderStudent.findOneAndUpdate(
  //   { '_id': req.body._id },
  //   req.body,
  //   { upsert: true, new: true }
  // ).then(doc => {
  //   res.json({error: false,errorType:null,data:doc });
  // }).catch(err => {
  //   res.json({error: true,errorType:err,data:null });
  // });
};


module.exports.uploadButDocument = async (req, res, next) => {
  let newDoc = new ButDocument({
    username: req.body.username,
    name: req.body.name,
    base64: req.body.base64,
    dateUploaded: new Date(),
    studentId: req.body.studentId,
    tenantId: req.body.tenantId,
    userId: req.body.userId,
    customerId: req.body.customerId
  });

  try {
    await newDoc.save();
    res.status(200).json({ success: true, message: 'Dokument erfolgreich hochgeladen' });
  } catch (error) {
    handleOrderError(error, res);
  }
};

module.exports.getButDocumentTenant = async (req, res, next) => {
  try {

    // Using await to wait for the result of Tenant.find()
    const allButCustomer = await ButDocument.find({ 'userId': req._id }, '-base64');

    // Sending the result back to the client
    res.json(allButCustomer);
  } catch (err) {
    // If an error occurs, log it and send an error response
    console.error('Error getTenant',err); // Log the error for debugging
    res.status(500).send({ message: 'Internal Server Error' });
  }
};
function handleOrderError(error, res) {
  let httpStatusCode = 500; // Default to Internal Server Error
  let userMessage = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.';

  console.error("Error during document saving:", error); // Detailed logging for internal use
  if (error.name && error.name === 'ValidationError') {
    httpStatusCode = 400; // Bad Request
    userMessage = 'Validierungsfehler. Bitte überprüfen Sie die eingegebenen Daten oder wenden Sie sich an unseren Kundenservice';
  }

  res.status(httpStatusCode).json({ success: false, message: userMessage });
}



