const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const buchungskontenSchema = new mongoose.Schema({
  customerId:{ type: Schema.Types.ObjectId, required: true },
  userId: { type: Schema.Types.ObjectId, required: true },
  customerNumber: {
    type: String,
    required: true
  },
  currentBalance: {
    type: Number,
    required: true,
    default: 0
  }
}, { timestamps: true }); // Automatisch createdAt & updatedAt

const Buchungskonten = mongoose.model('Buchungskonten', buchungskontenSchema);

module.exports = Buchungskonten;
