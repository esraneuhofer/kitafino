const mongoose = require("mongoose");
const TenantParent = mongoose.model('Tenantpartent');


module.exports.getTenantInformation = async (req, res, next) => {
  try {
    // Using await to wait for the result of Tenant.find()
    const allGroups = await TenantParent.find({ 'tenantId': req.tenantId });

    // Sending the result back to the client
    res.json(allGroups);
  } catch (err) {
    // If an error occurs, log it and send an error response
    console.error(err); // Log the error for debugging
    res.status(500).send({ message: 'Internal Server Error' });
  }
};

module.exports.addParentTenant = (req, res, next) => {
  let newModel = new TenantParent(req.body);
  newModel.schoolId = req.project_id;
  newModel.userId = req._id;
  newModel.customerId = req.customerId;
  newModel.tenantId = req.tenantId;
  newModel.save().then(function (data) {
    res.json(({student:data,error:false}));
  }, function (e) {
    res.json(({student:e,error:true}));
  });

}

