var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PricesGroupBillingSchema = new Schema({
  priceSpecial: Number,
  idSpecial: String,
  typeSpecial: String,
});

var DeadlineWeeklySchema = new Schema({
  weeks: { type: Number, required: true },
  day: { type: Number, required: true },
  time: { type: String, required: true },
});

var DeadlineDailySchema = new Schema({
  day: { type: Number, required: true },
  time: { type: String, required: true },
});

var CancelOrderDailySchema = new Schema({
  day: { type: Number, required: true },
  time: { type: String, required: true },
});

var generalSettingsSchema = new Schema({
  subGroupSettingTenant: { type: Boolean},
  allergiesSetByTenant: { type: Boolean},
  showOrderDaily: { type: Boolean},
  sendEmailOrderAfterDeadline: { type: Boolean},
  hasAdditionDaily:{ type: Boolean},
  hasCancelDaily: { type: Boolean},
  isDeadlineDaily: { type: Boolean },
  deadlineWeekly: { type: DeadlineWeeklySchema },
  deadlineDaily: { type: DeadlineDailySchema },
  cancelOrderDaily: { type: CancelOrderDailySchema },
  state: { type: String },
  showAllSpecialFood: { type: Boolean },
  allowOnlyOneMenu: { type: Boolean },
  hideMenuName: { type: Boolean },
});

var customerSchema = new Schema({
  tenantId: Schema.Types.ObjectId,
  customerId: Schema.Types.ObjectId,
  active: Boolean,
  order: {
    lastActionWeek: Number,
    deadLineDaily: {
      day: Number,
      time: String,
    },
    individualPricing: Boolean,
    addSubgroupsOrder: Boolean,
    ignoreMinOrder: Boolean,
    deliveryTime: String,
    permanentOrder: Boolean,
    showSpecialFood: Boolean,
    hideSpecialFood: Boolean,
    hideExtra: Boolean,
    specialShow: [{ idSpecialFood: String, nameSpecialFood: String, selected: Boolean }],
    split: [{
      displayGroup: String,
      group: String,
      raisePortion: {},
      idGroupType: Schema.Types.ObjectId
    }],
    dessert: Boolean,
    sidedish: Boolean,
    showExtraOrder: Boolean
  },
  settings: {
    firstAccess: Boolean,
    substitute: Boolean,
    remarks: String,
    state: String
  },
  billing: {
    headingInvoice: Array,
    group: [{
      groupId: String,
      idGroupType: Schema.Types.ObjectId,
      displayNameBilling: String,
      tax: String,
      individualPricing: Boolean,
      prices: [PricesGroupBillingSchema]
    }],
    isBrutto: Boolean,
    invoiceCycle: String,
    customerNumber: String,
    paymentMethod: Boolean,
    separatePrice: Boolean,
    separateBilling: Boolean,
    grossPrice: Boolean,
    iban: String,
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
    secondEmail: String,
    email: {
      type: String,
      lowercase: true,
      required: '{PATH} is required!'
    },
  },
  generalSettings: generalSettingsSchema,
});

var Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
