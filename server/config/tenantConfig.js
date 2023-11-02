const mongoose = require('mongoose');
const _ = require('lodash');
const User = mongoose.model('User');

exports.getTenantId = (req, res, next) => {
  User.findOne({_id: req._id},
    (err, user) => {
      if (!user)
        return null;
      else
        req.tenantId = JSON.parse(JSON.stringify(user)).tenantId;
      next();
  });


};
