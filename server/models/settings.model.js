var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var settings = new Schema(
  {
    tenantId: Schema.Types.ObjectId,
    orderSettings: {
      hideAllergene: Boolean,
      onlyShowEasyView: Boolean,
      displayTypeEmailOrder: String,
      hideEmptyOrderEmail: Boolean,
      displaySpecialMenuSimple: Boolean,
      sideOrDessertChoose: Boolean,
      deadLineDaily: {
        day: Number,
        time: String,
        timeBeginn: String,
        dayBeginn: Number,
        maxAmountRemove: Number,
        maxAmountAdd: Number
      },
      isDeadlineDaily: Boolean,
      showMenuWithoutName: Boolean,
      specialShowDessertIfShowMenu: Boolean,
      specialShowSideIfShowMenu: Boolean,
      specialShowPerMeal: Boolean,
      sideOrderSeparate: Boolean, // If true, sideDishes are declared in Ordersettings, if false, sideDishes are declared in CustomerModel
      dessertOrderSeparate: Boolean, // If true, dessert are declared in Ordersettings, if false, dessert are declared in CustomerModel
      specialFoods: [
        {
          nameSpecialFood: String,
          priceSpecialFood: [{ groupType: String, priceSpecial: Number }],
          allergenes: [String]
        }
      ],
      extraOption: [
        {
          nameExtra: String,
          priceExtra: Number,
          amountPerOrder: Number,
          description: String,
          active: Boolean
        }
      ],
      groupTypes: [{ nameGroupType: String, undeletable: Boolean }],
      specials: [
        {
          nameSpecial: String,
          typeOrder: String,
          isActive: Boolean,
          idSpecial: Schema.Types.ObjectId,
          pricesSpecial: [
            {
              groupType: Schema.Types.ObjectId,
              priceSpecial: Number
            }
          ]
        }
      ],

      isMinOrder: Boolean,
      minOrderAmount: Number,
      isMinOrderAmountSub: Boolean,
      minOrderAmountSub: Number,
      commentOption: Boolean,
      confirmationEmail: String,
      customerRegEmail: String,
      customerOrderWebURL: String,
      deadlineWeekly: {
        weeks: { type: String, required: '{PATH} is required!' },
        day: { type: String, required: '{PATH} is required!' },
        time: { type: Date, required: '{PATH} is required!' }
      },
      extraOrder: {
        deadlineExtraOrder: Array,
        extraOrderActive: Boolean,
        minOrder: Number
      }
    },
    invoiceSettings: {
      logo: {
        filetype: String,
        filename: String,
        base64: String,
        filesize: Number
      },
      footer: {
        footerLeft: Array,
        footerMiddle: Array,
        footerRight: Array
      },
      isEditInvoiceNumber: Boolean,
      typeEdit: String, // Can be either invoiceDate or customerNumber
      emailTextPaymentReminder: String,
      headingLine: String,
      header: Array,
      invoiceTextSecond: Array,
      invoiceText: Array,
      ccEmailAddressInvoice: String,
      emailTextStorno: String,
      secondInvoiceText: Boolean,
      sendEmailText: String,
      creditorIdentification: String
    },
    tenantSettings: {
      billing: {
        testPeriodEnds: Date,
        emailVerified: Date,
        paymentActive: Boolean,
        paymentVerified: Boolean,
        customerNumber: String,
        billingPlanSelected: Boolean,
        cancelSubscription: {
          cancel: Boolean,
          dateCancelling: Date
        },
        dateBillingPlanSelected: Date,
        billingPlan: Array,
        paymentType: {
          paymentType: String,
          paypal: {
            email: String
          },
          creditcard: {
            number: String,
            expirationDate: String,
            name: String,
            csv: Number,
            dateAdded: Date,
            cardType: String
          },
          bank: {
            isActive: Boolean,
            iban: String,
            bic: String,
            name: String
          }
        },
        billingAddress: {
          companyName: String,
          companySecond: String,
          street: String,
          streetAddition: String,
          zipCode: String,
          city: String,
          country: String
        }
      },
      contact: {
        companyName: String,
        contactPerson: String,
        phone: String,
        email: {
          type: String,
          required: '{PATH} is required!'
        }
      },
      invoice: {
        header: Array,
        invoiceTitle: String,
        footerOne: Array,
        footerTwo: Array,
        footerThree: Array
      },
      settings: {
        showTooltip: Boolean,
        firstAccess: Boolean,
        stateHol: String
      },
      twillio: {
        accountSid: String,
        authToken: String
      }
    }
  },
  { versionKey: false }
);

var Settings = mongoose.model('Settings', settings);

module.exports = Settings;
