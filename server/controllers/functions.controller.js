const mongoose = require('mongoose');
const _ = require('lodash');

module.exports.editObject = (model) =>{
  return function (req, res, next) {
    model.findOneAndUpdate({
      '_id': req.body._id
    }, req.body, {
      upsert: true
    }, function (err, doc) {
      if (err) return res.send(500, {
        error: err
      });
      return res.send(req.body);
    });
  };
}



module.exports.addObjectTenant = (model) =>{
  return function (req, res, next) {
    req.body.customerId = req._id;
    req.body.tenantId = req.tenantId;
    var newModel = new model(req.body);
    newModel.save().then(function (data) {
      res.json(data);
    }, function (e) {
      res.json(e)
    });
  };
};
module.exports.deleteObject = (model) =>{
  return function (req, res, next) {
    model.remove({
      '_id': req.body._id
    }, function (err) {
      if (err) {
        res.send(err);
      } else {
        res.json('Deleted');
      }

    });
  };
};
module.exports.getObjectTenant = (model) =>{
  return function (req, res, next) {
    model.find({'tenantId': req.tenantId}, function (err, allGroups) {
      if (err) {
        res.send(err);
      } else {
        res.json(allGroups);
      }
    });
  };
};
module.exports.getSingleObjectTenant = (model) =>{
  return function (req, res, next) {
    model.findOne({'_id': req.query._id}, function (err, item) {
      if (err) {
        res.send(err);
      } else {
        res.json(item);
      }
    });
  };
}
module.exports.getSingleObjectTenantBy_Id = (model) =>{
  return function (req, res, next) {
    model.findOne({'tenantId': req._id}, function (err, item) {
      if (err) {
        res.send(err);
      } else {
        res.json(item);
      }
    });
  };
}
