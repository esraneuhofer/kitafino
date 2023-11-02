const mongoose = require("mongoose");
const Student = mongoose.model('Student');

module.exports.getRegisteredStudentsUser = (req, res, next) =>{

    Student.find({'tenantId': req.tenantId}, function (err, allGroups) {
      if (err) {
        res.send(err);
      } else {
        res.json(allGroups);
      }
    });
};
