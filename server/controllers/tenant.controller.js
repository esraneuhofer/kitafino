const mongoose = require("mongoose");
const Tenant = mongoose.model('Student');

module.exports.getRegisteredStudentsUser = (req, res, next) =>{

    Tenant.find({'tenantId': req.tenantId}, function (err, allGroups) {
        if (err) {
            res.send(err);
        } else {
            res.json(allGroups);
        }
    });
};
