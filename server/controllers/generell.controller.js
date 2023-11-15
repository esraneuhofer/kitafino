const mongoose = require("mongoose");
const Settings = mongoose.model('Settings');


module.exports.getSettingsTenant = async (req, res, next) => {
  try {
    // Using await to wait for the result of Tenant.find()
    const setting = await Settings.findOne({ 'tenantId': req.tenantId });

    // Sending the result back to the client
    res.json(setting);
  } catch (err) {
    // If an error occurs, log it and send an error response
    console.error(err); // Log the error for debugging
    res.status(500).send({ message: 'Internal Server Error' });
  }
};
