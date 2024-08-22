var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var school = new Schema({
  tenantId: Schema.Types.ObjectId,
  customerId: Schema.Types.ObjectId,
  contactPerson: String,
  whoPayCharges: {
    type: String,
    enum: ['student', 'customer', 'tenant', ''],
  },
  amountPerOrder: {
    type: Number,
  },
  billingCycle: {
    type: String,
    enum: ['weekly', 'monthly', ''],
  },
  tax: {
    type: Number,
  },
  billingAddress: [
    {
      heading: {
        type: String,
      },
    },
  ],
  emailBilling: {
    type: String,
  },
  kundennummer: {
    type: String,
  },
  emailCatering: {
    type: String,
  },
  emailSchool: {
    type: String,
  },
  projectId: {
    type: String,
  },
  essensgeldEinrichtung:Number,
  paymentInformation: {
    creditorIban: String,
    creditorBic: String,
    creditorName: String,
  }
});

var SchoolNew = mongoose.model('SchoolNew', school);

module.exports = SchoolNew;

