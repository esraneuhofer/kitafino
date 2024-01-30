var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var tenantpartent = new Schema({
  tenantId:Schema.Types.ObjectId,
  customerId:Schema.Types.ObjectId,
  schoolId:Schema.Types.ObjectId,
  userId:Schema.Types.ObjectId,
  firstName:String,
  lastName:String,
  email:String,
  phone:String,
  address:String,
  city:String,
  zip:String,
  username:String,
  orderSettings:{
    orderConfirmationEmail:Boolean,
    sendReminderBalance:Boolean,
    amountBalance:Number,
    permanentOrder:Boolean,
  }
});

var Tenantpartent = mongoose.model('Tenantpartent', tenantpartent);

tenantpartent.pre('save', async function (next) {
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
module.exports = Tenantpartent;

