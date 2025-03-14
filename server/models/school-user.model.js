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
  customerId:Schema.Types.ObjectId,
  tenantId:Schema.Types.ObjectId,
  project_id:Schema.Types.ObjectId,
  saltSecret: String,
  isAdminSchool:Boolean,
  username: {type:String,unique: true},
  tenantUrl:String,
  // Updated token structure to include device information
  token:[{
    tokenValue: String,
    deviceId: String,
    platform: String,
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }],
});

// Methods
schoolSchema.methods.verifyPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

schoolSchema.methods.generateJwt = function () {
  return jwt.sign({_id: this._id},
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXP
    });
}
mongoose.model('Schooluser', schoolSchema);
