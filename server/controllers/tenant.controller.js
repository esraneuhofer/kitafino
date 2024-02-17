const mongoose = require("mongoose");
const TenantParent = mongoose.model('Tenantparent');
const AccountSchema = mongoose.model('AccountSchema');

module.exports.getTenantInformation = async (req, res, next) => {
  try {
    // Using await to wait for the result of Tenant.find()
    const allGroups = await TenantParent.findOne({ 'userId': req._id });

    // Sending the result back to the client
    res.json(allGroups);
  } catch (err) {
    // If an error occurs, log it and send an error response
    console.error(err); // Log the error for debugging
    res.status(500).send({ message: 'Internal Server Error' });
  }
};

module.exports.editParentTenant = (req, res, next) => {
  TenantParent.findOneAndUpdate(
    { '_id': req.body._id },
    req.body,
    { upsert: true, new: true }
  ).then(doc => {
    return res.send(doc);
  }).catch(err => {
    return res.status(500).send({ error: err });
  });
};

module.exports.addParentTenant = (req, res, next) => {

  if (!req.body.firstName || !req.body.lastName) {
    return res.json({ error: true, message: 'Both firstname and lastname must be provided.' });
  }

  let newTenant = new TenantParent({
    schoolId : req.project_id,
    userId : req._id,
    customerId : req.customerId,
    tenantId : req.tenantId,
    firstName : req.body.firstName,
    lastName : req.body.lastName,
    email : req.body.email,
    phone :  req.body.phone,
    address : req.body.address,
    city : req.body.city,
    zip : req.body.zip,
    orderSettings : {
      orderConfirmationEmail: false,
      sendReminderBalance: false,
      amountBalance: 0,
      permanentOrder: false,
    },
  });
  console.log(newTenant);
  newTenant.save().then(function (data) {
    res.json({error: false,errorType:null });
  }, function (e) {
    res.json({error: true, errorType:e });
  });
  // newTenant.save()
  //   .then(tenantData => {
  //     // Tenant saved successfully, now create the account
  //     let newAccount = new AccountSchema({
  //       tenantId: req.tenantId,
  //       customerId: req.customerId,
  //       schoolId: req.project_id,
  //       userId: req._id,
  //       transactions: [],
  //       currentBalance: 0,
  //       orders: []
  //     });
  //
  //     newAccount.save()
  //       .then(accountData => {
  //         // Account created successfully
  //         res.json({ tenant: tenantData, account: accountData, error: false });
  //       })
  //       .catch(accountError => {
  //         // Handle error in account creation
  //         console.error('Error creating account', accountError);
  //         res.status(500).json({ message: 'Account creation failed', error: true });
  //       });
  //   })
  //   .catch(tenantError => {
  //     // Handle error in tenant saving
  //     console.error('Error saving tenant', tenantError);
  //     res.status(500).json({ message: 'Tenant saving failed', error: true });
  //   });
};
