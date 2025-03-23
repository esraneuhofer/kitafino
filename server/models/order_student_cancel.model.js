const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');


dayjs.extend(utc);
dayjs.extend(timezone);


var orderStudentCancelSchema = new Schema({
  isBut:{type:Boolean,default:false},
  subgroup:String,
  billed: {
    type: Boolean,
    default: false
  },
  tenantId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  customerId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  kw: {
    type: Number,
    required: '{PATH} is required!'
  },
  year: {
    type: Number,
    required: '{PATH} is required!'
  },
  order: {
    type: Schema.Types.Mixed,
    required: true
  },
  studentId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  dateOrder: {
    type: String,
    required: '{PATH} is required!',
    validate: {
      validator: function (v) {
        const normalized = normalizeToBerlinDate(v);
        return /^\d{4}-\d{2}-\d{2}$/.test(normalized);
      },
      message: 'Datum muss im Format YYYY-MM-DD sein'
    },
    set: function (v) {
      return normalizeToBerlinDate(v);
    }
  },
  dateOrderPlaced: {
    type: String,
    set: function (v) {
      return normalizeToBerlinDateSeconds(new Date());
    }
  },
  dateOrderCanceled: {
    type: String,
    set: function (v) {
      return normalizeToBerlinDateSeconds(new Date());
    }
  },
  postInfo: [{
    postId: Schema.Types.ObjectId,
    postDate: String
  }],
  orderId: {
    type: Schema.Types.ObjectId,
    required: '{PATH} is required!'
  },
  orderPlacedBy:String,
  orderCanceledBy:String
}, {
  timestamps: true,

});


// Pre-save Middleware
orderStudentCancelSchema.pre('save', async function (next) {
  try {
    this.dateOrderPlaced = normalizeToBerlinDate(new Date());
    next();
  } catch (error) {
    next(error);
  }
});

// Hauptindex für die Eindeutigkeit von Bestellungen
orderStudentCancelSchema.index(
  {studentId: 1, dateOrder: 1},
  {
    unique: true,
    name: 'student_date_unique',
    background: true
  }
);

// Zusätzlicher Index für Customer-Abfragen
orderStudentCancelSchema.index(
  {customerId: 1, dateOrder: 1},
  {name: 'customer_date_lookup', background: true}
);

orderStudentCancelSchema.statics = {
  editOrderToCancel: async function (orderId, orderCanceledBy, session) {
    if (!orderId) {
      throw new Error('OrderID erforderlich');
    }
    
    // Find the original order
    const OrderStudent = mongoose.model('OrderStudent');
    const originalOrder = await OrderStudent.findOne({ orderId }).session(session);
    
    if (!originalOrder) {
      throw new Error('Die zu stornierende Bestellung konnte nicht gefunden werden');
    }
    
    // Create a new cancel order document
    const orderData = originalOrder.toObject();
    delete orderData._id;
    
    const cancelOrder = new this({
      ...orderData,
      dateOrderCanceled: normalizeToBerlinDate(new Date()),
      orderCanceledBy: orderCanceledBy || ''
    });
    
    // Save the cancel order with session
    return await cancelOrder.save({ session });
  }
};

function normalizeToBerlinDate(date) {
  try {
    return dayjs(date)
      .tz('Europe/Berlin')
      .format('YYYY-MM-DD');
  } catch (error) {
    console.error('Fehler bei der Datums-Normalisierung:', error);
    return date;
  }
}

function normalizeToBerlinDateSeconds(date) {
  try {
    return dayjs(date)
      .tz('Europe/Berlin')
      .format('YYYY-MM-DD HH:mm:ss');
  } catch (error) {
    console.error('Fehler bei der Datums-Normalisierung:', error);
    return date;
  }
}



var OrderStudentCancel = mongoose.model('OrderStudentCancel', orderStudentCancelSchema);

module.exports = OrderStudentCancel;
