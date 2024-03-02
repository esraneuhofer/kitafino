var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var pricesGroupBillingSchema = new Schema({
  priceSpecial:Number,
  idSpecial:String,
  typeSpecial:String,
})


var customer = new Schema({
  tenantId: Schema.Types.ObjectId,
  customerId: Schema.Types.ObjectId,
  active:Boolean,
  order: {
    lastActionWeek: Number,

    individualPricing: Boolean,
    addSubgroupsOrder: Boolean,
    ignoreMinOrder:Boolean,
    deliveryTime: String,
    permanentOrder: Boolean,
    showSpecialFood:Boolean,
    hideSpecialFood:Boolean,
    hideExtra:Boolean,
    specialShow:[{idSpecialFood:String,nameSpecialFood:String,selected:Boolean}],
    // split: Array,
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
      groupId:String,
      idGroupType:Schema.Types.ObjectId,
      displayNameBilling:String,
      tax:String,
      individualPricing:Boolean,
      prices:[pricesGroupBillingSchema]
    }],
    invoiceCycle: String,
    customerNumber: String,
    paymentMethod: Boolean,
    // tax:String,
    // pricePortion:Number,
    separatePrice: Boolean,
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
