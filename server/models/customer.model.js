var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var customer = new Schema({
  tenantId: Schema.Types.ObjectId,
  customerId: Schema.Types.ObjectId,
  active:Boolean,
  order: {
    ignoreMinOrder:Boolean,
    deliveryTime: String,
    permanentOrder: Boolean,
    hideSpecialFood:Boolean,
    hideExtra:Boolean,
    specialsHidden: [{ idSpecial:String,nameSpecial:String,selected:Boolean }],
    specialShow:[{idSpecialFood:String,nameSpecialFood:String,selected:Boolean}],

    split: [{
      displayGroup:String,
      group:String,
      raisePortion:{},
      idGroupType:Schema.Types.ObjectId
    }],
    // orderCycle:{type:String,required:'{PATH} is required!'},
    dessert: Boolean,
    sidedish:Boolean,
    showExtraOrder:Boolean
  },
  settings: {
    firstAccess: Boolean,
    substitute: Boolean,
    remarks:String,
    state:String
  },
  billing: {
    headingInvoice: Array,
    group: [{
      tax:String,
      pricePortion:Number
    }],
    invoiceCycle: String,
    customerNumber: String,
    paymentMethod: Boolean,
    // tax:String,
    // pricePortion:Number,
    separateBilling: Boolean,
    grossPrice:Boolean,
    iban:String,
  },
  contact: {
    customer: {
      type: String,
      required: '{PATH} is required!'
    },
    street: String,
    zipcode: String,
    contactPerson: String,
    phone: String,
    fax: String,
    secondEmail:String,
    email: {
      type: String,
      lowercase: true,
      // unique: true,
      required:'{PATH} is required!'
    },

  }

});


var Customer = mongoose.model('Customer', customer);

module.exports = Customer;

