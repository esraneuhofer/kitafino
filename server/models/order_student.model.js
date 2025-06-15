const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const Buchungskonten = mongoose.model('Buchungskonten');

dayjs.extend(utc);
dayjs.extend(timezone);

var orderStudentSchema = new Schema(
  {
    isBut: { type: Boolean },
    subgroup: String,
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
      }
      // set: function (v) {
      //   return normalizeToBerlinDate(v);
      // }
    },
    orderId: {
      type: Schema.Types.ObjectId,
      required: '{PATH} is required!'
    },
    orderPlacedBy: String,
    orderProcessedBuchung: { type: Boolean, default: false }
  },
  {
    timestamps: true // Fügt automatisch createdAt und updatedAt hinzu
  }
);

function normalizeToBerlinDate(date) {
  try {
    return dayjs(date).tz('Europe/Berlin').format('YYYY-MM-DD');
  } catch (error) {
    console.error('Fehler bei der Datums-Normalisierung:', error);
    return date;
  }
}

function normalizeToBerlinDateSeconds(date) {
  try {
    return dayjs(date).tz('Europe/Berlin').format('YYYY-MM-DD HH:mm:ss');
  } catch (error) {
    console.error('Fehler bei der Datums-Normalisierung:', error);
    return date;
  }
}

// orderStudentSchema.pre('save', async function (next) {
//   try {
//     // Bestehende Funktionalität beibehalten

//     // Neuer Code: Buchungskonto finden und aktualisieren
//     if (this.isNew && !this.orderProcessedBuchung) { // Nur bei neuen Bestellungen das Konto belasten
//       const orderPlaced = getOrderPlaced(this);

//       if (orderPlaced && orderPlaced.priceOrder) {
//         try {
//           // Buchungskonto finden
//           const buchungskonto = await Buchungskonten.findOne({ userId: this.userId });

//           if (buchungskonto) {
//             // Aktuelle Bestellung vom Kontostand abziehen
//             buchungskonto.currentBalance -= orderPlaced.priceOrder;

//             // Buchungskonto speichern
//             await buchungskonto.save();

//             // Erfolgreich verarbeitet
//             this.orderProcessedBuchung = true;
//             console.log(`Buchungskonto für userId ${this.userId} aktualisiert. Neuer Kontostand: ${buchungskonto.currentBalance}`);
//           } else {
//             // Kein Konto gefunden, aber kein Fehler
//             this.orderProcessedBuchung = false;
//             console.log(`Kein Buchungskonto für userId ${this.userId} gefunden`);
//           }
//         } catch (buchungsError) {
//           // Fehler beim Aktualisieren des Buchungskontos
//           this.orderProcessedBuchung = false;
//           console.error('Fehler beim Aktualisieren des Buchungskontos:', buchungsError);
//         }
//       }
//     }

//     // Bestellung wird immer gespeichert, unabhängig vom Status der Buchungskonto-Aktualisierung
//     next();
//   } catch (error) {
//     console.error('Allgemeiner Fehler beim Speichern der Bestellung:', error);
//     next(error);
//   }
// });
// Hauptindex für die Eindeutigkeit von Bestellungen
orderStudentSchema.index(
  { studentId: 1, dateOrder: 1 },
  {
    unique: true,
    name: 'student_date_unique',
    background: true
  }
);

// Zusätzlicher Index für Customer-Abfragen
orderStudentSchema.index({ customerId: 1, dateOrder: 1 }, { name: 'customer_date_lookup', background: true });

orderStudentSchema.statics = {
  // 1. Bestellungen eines Customers in einem Datumsbereich
  findByCustomerAndDateRange: async function (customerId, startDate, endDate) {
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
  findByCustomerAndDay: async function (customerId, date) {
    if (!customerId || !date) {
      throw new Error('CustomerId und Datum sind erforderlich');
    }

    const normalizedDate = normalizeToBerlinDate(date);

    return this.find({
      customerId: customerId,
      dateOrder: normalizedDate
    }).lean();
  },

  // 3. Bereits existierende Student-Methoden
  findByStudentAndDateRange: async function (studentId, startDate, endDate) {
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

  findByStudentAndDay: async function (studentId, date) {
    if (!studentId || !date) {
      throw new Error('StudentId und Datum sind erforderlich');
    }

    // console.log('findByStudentAndDay - Direct collection query for:', { studentId, dateOrder: date });

    // Direkter MongoDB-Query ohne Schema-Hooks um Zeitzonenproblem zu vermeiden
    const result = await this.collection.findOne({
      studentId: new mongoose.Types.ObjectId(studentId),
      dateOrder: date
    });

    // console.log(
    //   'findByStudentAndDay - Found result:',
    //   result ? `Order for date ${result.dateOrder}` : 'No result found'
    // );
    return result;
  }
};

function getOrderPlaced(orderStudent) {
  let orderPlaced;
  orderStudent.order.orderMenus.forEach((eachOrder) => {
    if (eachOrder.amountOrder > 0) {
      orderPlaced = eachOrder;
    }
  });
  if (!orderPlaced) {
    orderStudent.order.specialFoodOrder.forEach((eachOrder) => {
      if (eachOrder.amountSpecialFood > 0) {
        orderPlaced = eachOrder;
      }
    });
  }
  return orderPlaced;
}

var OrderStudent = mongoose.model('OrderStudent', orderStudentSchema);

module.exports = OrderStudent;
