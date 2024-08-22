const mongoose = require("mongoose");
const School = mongoose.model('SchoolNew');



module.exports.getSchoolSettings = async (req, res, next) => {
  try {
    // Using await to wait for the result of Tenant.find()
    const SchoolSetting = await School.findOne({ 'customerId': req.customerId });
    // Sending the result back to the client
    res.json(SchoolSetting);
  } catch (err) {
    console.error('HelpModel:', err); // Log the error for debugging
    res.status(500).json({ message: 'HelpModel kann nciht gefuden werden', error: err.message });
  }
};
