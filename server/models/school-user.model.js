
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
var Schema = mongoose.Schema;

var schoolSchema = new mongoose.Schema({
  email: {
    type: String,
    required: 'Email can\'t be empty',

  },
  password: {
    type: String,
    required: 'Password can\'t be empty',
    // minlength: [4, 'Password must be atleast 4 character long']
  },
  tenantId:Schema.Types.ObjectId,
  project_id:Schema.Types.ObjectId,
  saltSecret: String,
  isAdminSchool:Boolean,
  // projectId: String,
  // project: String,
  username: {type:String,unique: true},
  tenantUrl:String,
  passwordO:String
});


mongoose.model('Schooluser', schoolSchema);
