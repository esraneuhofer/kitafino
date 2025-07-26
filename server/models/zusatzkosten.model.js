const mongoose = require('mongoose');

const zusatzKostenSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentSchema',
      required: false
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OrderStudent'
    },
    createdAt: {
      type: Date,
      default: Date.now,
      required: true
    },
    cost: {
      type: Number,
      required: true,
      min: 0
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    dateOrder: {
      type: Date,
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: ['nachbestellung', 'abbestellung', 'sonstiges'],
      default: 'nachbestellung'
    },
    description: {
      type: String,
      required: false
    }
  },
  {
    timestamps: true,
    collection: 'zusatzkosten'
  }
);

// Index für bessere Performance
zusatzKostenSchema.index({ userId: 1, createdAt: -1 });
zusatzKostenSchema.index({ dateOrder: 1 });
zusatzKostenSchema.index({ type: 1 });

module.exports = mongoose.model('ZusatzKosten', zusatzKostenSchema);
