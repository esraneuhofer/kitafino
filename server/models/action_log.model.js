// models/actionLog.js
const mongoose = require("mongoose");

const actionLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tenant",
    required: true,
  },
  actionType: {
    type: String,
    enum: [
      "DAUERBESTELLUNG_ERSTELLEN",
      "DAUERBESTELLUNG_LOESCHEN",
      "DAUERBESTELLUNG_AENDERN",
      "KIND_ANMELDEN",
      "KIND_ABMELDEN",
      "TENANT_AENDERN",
      "TENANT_ANLEGEN",
      "KIND_AENDERN",
      "FERIEN_LOESCHEN",
    ],
    required: true,
  },
  details: {
    type: mongoose.Schema.Types.Mixed, // Für zusätzliche Informationen
    default: {},
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Indizes für schnelle Abfragen
actionLogSchema.index({ userId: 1 });
actionLogSchema.index({ tenantId: 1 });
actionLogSchema.index({ actionType: 1 });
actionLogSchema.index({ timestamp: 1 });

const ActionLog = mongoose.model("ActionLog", actionLogSchema);
module.exports = ActionLog;
