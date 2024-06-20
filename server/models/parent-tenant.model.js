var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var tenantparent = new Schema({
  firstAccess:Boolean,
  firstAccessOrder:Boolean,
  tenantId:Schema.Types.ObjectId,
  customerId:Schema.Types.ObjectId,
  schoolId:Schema.Types.ObjectId,
  userId:Schema.Types.ObjectId,
  firstName:String,
  lastName:String,
  email: {type: String, required: true},
  phone: {type: String, required: true},
  address:String,
  city:String,
  zip:String,
  iban:String,
  username:String,
  orderSettings:{
    orderConfirmationEmail:Boolean,
    displayTypeOrderWeek:Boolean,
    sendReminderBalance:Boolean,
    amountBalance:Number,
    permanentOrder:Boolean,
  }
});

tenantparent.pre('save', async function (next) {
  try {

    if (!this.firstName || !this.lastName) {
      throw new Error('Both firstName and lastName must be defined.');
    }

    let username;
    let isUnique = false;

    while (!isUnique) {
      // Generate the username based on firstName, lastName, and a random 4-digit number
      const randomDigits = Math.floor(1000 + Math.random() * 9000); // Generate a random 4-digit number
      username = (this.firstName.slice(0, 2) + this.lastName.slice(0, 2) + randomDigits).toLowerCase();
      console.log(username)

      // Check if the generated username is unique
      const existingStudent = await this.constructor.findOne({ username });
      if (!existingStudent) {
        // If the username is unique, break out of the loop
        isUnique = true;
      }
    }
    // Set the unique username
    this.username = username;
    next();
  } catch (error) {
    next(error);
  }
});

var Tenantparent = mongoose.model('Tenantparent', tenantparent);

module.exports = Tenantparent;

