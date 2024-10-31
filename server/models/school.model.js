var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var school = new Schema({
  tenantId: Schema.Types.ObjectId,
  customerId: Schema.Types.ObjectId,
  contactPerson: String,
  whoPayCharges: {
    type: String
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
    unique: true,
  },
  startContract: {
    type: Date,
  },
  essensgeldEinrichtung:Number,
  hasEssensgeldEinrichtung:Boolean,
  paymentInformation: {
    creditorIban: String,
    creditorBic: String,
    creditorName: String,
  },
  paymentInformationEinrichtung :{
    creditorIban: String,
    creditorBic:  String,
    creditorName:  String,
  },
  billingAddressEinrichtung: [ {
    heading: {
      type: String,
    },
  }],
  emailBillingEinrichtung: String,
  contactPersonEinrichtung: String,
  nameCateringCompany:String,
  nameEinrichtung:String
});

school.pre('save', function (next) {
  if (this.startContract) {
    this.startContract = new Date(this.startContract);
  }
  next();
});

var SchoolNew = mongoose.model('SchoolNew', school);

module.exports = SchoolNew;

