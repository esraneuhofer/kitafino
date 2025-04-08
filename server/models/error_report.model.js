// models/ErrorReport.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ErrorReportSchema = new Schema({
  message: {
    type: String,
    required: true
  },
  typeError: {
    type: String,
    required: true,
    enum: ['fehler', 'verbesserung', 'frage']
  },
  route: {
    type: String,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    default: 'neu',
    enum: ['neu', 'in_bearbeitung', 'abgeschlossen']
  }
});

module.exports = mongoose.model('ErrorReport', ErrorReportSchema);
