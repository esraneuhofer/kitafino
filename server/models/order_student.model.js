const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

var orderStudentSchema = new Schema({
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
      validator: function(v) {
        const normalized = normalizeToBerlinDate(v);
        return /^\d{4}-\d{2}-\d{2}$/.test(normalized);
      },
      message: 'Datum muss im Format YYYY-MM-DD sein'
    },
    set: function(v) {
      return normalizeToBerlinDate(v);
    }
  },
  dateOrderPlaced: {
    type: String,
    set: function(v) {
      return normalizeToBerlinDate(v || new Date());
    }
  },
  postInfo: [{
    postId: Schema.Types.ObjectId,
    postDate: String
  }],
  orderId: {
    type: Schema.Types.ObjectId,
    required: '{PATH} is required!'
  }
}, {
  timestamps: true // Fügt automatisch createdAt und updatedAt hinzu
});

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

// Pre-save Middleware
orderStudentSchema.pre('save', async function(next) {
  try {
    this.dateOrderPlaced = normalizeToBerlinDate(new Date());
    next();
  } catch (error) {
    next(error);
  }
});

// Hauptindex für die Eindeutigkeit von Bestellungen
orderStudentSchema.index(
  {studentId: 1, dateOrder: 1},
  {
    unique: true,
    name: 'student_date_unique',
    background: true
  }
);


// Zusätzlicher Index für Customer-Abfragen
orderStudentSchema.index(
  {customerId: 1, dateOrder: 1},
  {name: 'customer_date_lookup', background: true}
);

orderStudentSchema.statics = {
  // 1. Bestellungen eines Customers in einem Datumsbereich
  findByCustomerAndDateRange: async function(customerId, startDate, endDate) {
    if (!customerId || !startDate || !endDate) {
      throw new Error('CustomerId und Datumsbereich (Start und Ende) sind erforderlich');
    }

    return this.find({
      customerId: customerId,
      dateOrder: {
        $gte: normalizeToBerlinDate(startDate),
        $lte: normalizeToBerlinDate(endDate)
      }
    })
      .sort({ dateOrder: 1 })
      .lean();
  },

  // 2. Bestellungen eines Customers an einem spezifischen Tag
  findByCustomerAndDay: async function(customerId, date) {
    if (!customerId || !date) {
      throw new Error('CustomerId und Datum sind erforderlich');
    }

    const normalizedDate = normalizeToBerlinDate(date);

    return this.find({
      customerId: customerId,
      dateOrder: normalizedDate
    })
      .lean();
  },

  // 3. Bereits existierende Student-Methoden
  findByStudentAndDateRange: async function(studentId, startDate, endDate) {
    if (!studentId || !startDate || !endDate) {
      throw new Error('StudentId und Datumsbereich (Start und Ende) sind erforderlich');
    }

    return this.find({
      studentId: studentId,
      dateOrder: {
        $gte: normalizeToBerlinDate(startDate),
        $lte: normalizeToBerlinDate(endDate)
      }
    })
      .sort({ dateOrder: 1 })
      .lean();
  },

  findByStudentAndDay: async function(studentId, date) {
    if (!studentId || !date) {
      throw new Error('StudentId und Datum sind erforderlich');
    }

    const normalizedDate = normalizeToBerlinDate(date);

    return this.findOne({
      studentId: studentId,
      dateOrder: normalizedDate
    })
      .lean();
  }
};



var OrderStudent = mongoose.model('OrderStudent', orderStudentSchema);

module.exports = OrderStudent;
