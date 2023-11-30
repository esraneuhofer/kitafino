const mongoose = require("mongoose");
const TenantParent = mongoose.model('Tenantpartent');
const AccountSchema = mongoose.model('AccountSchema');

module.exports.getTenantInformation = async (req, res, next) => {
  try {
    // Using await to wait for the result of Tenant.find()
    const allGroups = await TenantParent.findOne({ 'tenantId': req.tenantId });

    // Sending the result back to the client
    res.json(allGroups);
  } catch (err) {
    // If an error occurs, log it and send an error response
    console.error(err); // Log the error for debugging
    res.status(500).send({ message: 'Internal Server Error' });
  }
};

// module.exports.addParentTenant = (req, res, next) => {
//   let newModel = new TenantParent(req.body);
//   newModel.schoolId = req.project_id;
//   newModel.userId = req._id;
//   newModel.customerId = req.customerId;
//   newModel.tenantId = req.tenantId;
//   newModel.save().then(function (data) {
//     res.json(({student:data,error:false}));
//   }, function (e) {
//     res.json(({student:e,error:true}));
//   });
// }
//
// function addAccount(){
//   let newModel = new AccountSchema();
//   newModel.tenantId = req.tenantId;
//   newModel.userId = req._id;
//   ewModel.customerId = req.customerId;
//   newModel.schoolId = req.project_id;
//   transitions = [];
//   currentBalance = 0;
//   orders = [];
// }

module.exports.addParentTenant = (req, res, next) => {
  let newTenant = new TenantParent(req.body);
  newTenant.schoolId = req.project_id;
  newTenant.userId = req._id;
  newTenant.customerId = req.customerId;
  newTenant.tenantId = req.tenantId;

  newTenant.save()
    .then(tenantData => {
      // Tenant saved successfully, now create the account
      let newAccount = new AccountSchema({
        tenantId: req.tenantId,
        userId: req._id,
        customerId: req.customerId,
        schoolId: req.project_id,
        transactions: [],
        currentBalance: 0,
        orders: []
      });

      newAccount.save()
        .then(accountData => {
          // Account created successfully
          res.json({ tenant: tenantData, account: accountData, error: false });
        })
        .catch(accountError => {
          // Handle error in account creation
          console.error('Error creating account', accountError);
          res.status(500).json({ message: 'Account creation failed', error: true });
        });
    })
    .catch(tenantError => {
      // Handle error in tenant saving
      console.error('Error saving tenant', tenantError);
      res.status(500).json({ message: 'Tenant saving failed', error: true });
    });
};
