const mongoose = require("mongoose");
const Student = mongoose.model('Student');
//
// module.exports.getRegisteredStudentsUser = (req, res, next) =>{
//
//     Student.find({'tenantId': req.tenantId}, function (err, allGroups) {
//       if (err) {
//         res.send(err);
//       } else {
//         res.json(allGroups);
//       }
//     });
// };

module.exports.addStudent = (req, res, next) => {
  // Ensure that firstname and lastname are present in req.body
  if (!req.body.firstName || !req.body.lastName) {
    return res.json({ error: true, message: 'Both firstname and lastname must be provided.' });
  }

  let newModel = new Student({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    // Set other properties as needed
    schoolId: req.project_id,
    userId: req._id,
    customerId: req.customerId,
    tenantId: req.tenantId,
  });

  newModel.save().then(function (data) {
    res.json({ student: data, error: false });
  }, function (e) {
    res.json({ student: e, error: true });
  });
}

