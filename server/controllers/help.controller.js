const mongoose = require("mongoose");
const Help = mongoose.model('HelpSchema');



module.exports.getSingleHelpPdfBase = async (req, res, next) => {
  try {
    // Using await to wait for the result of Tenant.find()
    const HelpModel = await Help.findOne({ 'routeName': req.query.routeName });
    // Sending the result back to the client
    res.json(HelpModel);
  } catch (err) {
    console.error('HelpModel:', err); // Log the error for debugging
    res.status(500).json({ message: 'HelpModel kann nciht gefuden werden', error: err.message });
  }
};

module.exports.getSingleHelpPdfBaseLogin = async (req, res, next) => {
  try {
    // Using await to wait for the result of Tenant.find()
    const HelpModel = await Help.findOne({ 'routeName': req.query.routeName, lang: req.query.language });
    // Sending the result back to the client
    res.json(HelpModel);
  } catch (err) {
    console.error('HelpModel:', err); // Log the error for debugging
    res.status(500).json({ message: 'HelpModel kann nciht gefuden werden', error: err.message });
  }
};


module.exports.getAllHelpPdfNames = async (req, res, next) => {
  try {
    // Using await to wait for the result of Tenant.find()
    const HelpModel = await Help.find({},'nameFile routeName');
    // Sending the result back to the client
    res.json(HelpModel);
  } catch (err) {
    console.error('Vertragspartner Informationen:', err); // Log the error for debugging
    res.status(500).json({ message: 'Vertragspartner Informationen konnte nicht geladen werden', error: err.message });
  }
};
