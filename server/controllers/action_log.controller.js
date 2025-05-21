// utils/logger.js
const ActionLog = require('../models/action_log.model');

/**
 * Loggt eine wichtige Benutzeraktion
 * @param {String} userId - ID des Benutzers
 * @param {String} tenantId - ID des Mandanten
 * @param {String} actionType - Art der Aktion
 * @param {Object} details - Zusätzliche Details zur Aktion (optional)
 * @returns {Promise<boolean>} - Gibt an, ob das Logging erfolgreich war
 */
const logUserAction = async (userId, tenantId, actionType, details = {}) => {
  try {
    const log = new ActionLog({
      userId,
      tenantId,
      actionType,
      details
    });
    await log.save();
    console.log(`Aktion geloggt: ${actionType} für Benutzer ${userId}`);
    return true;
  } catch (error) {
    console.error('Fehler beim Loggen der Aktion:', error);
    // Hier könntest du den Fehler an ein separates Fehlerlogging-System senden
    return false;
  }
};

function getChangeTenant(doc) {
  return{
          '_id': doc._id,
          'Vorname': doc.firstName || 'N/A',
          'Nachname': doc.lastName || 'N/A',
          'E-Mail': doc.email || 'N/A',
          'Telefon': doc.phone || 'N/A',
          'IBAN': doc.iban || 'N/A',
          'Bestaetigung': doc.orderSettings.orderConfirmationEmail,
          'Erinnerung': doc.orderSettings.sendReminderBalance,
        }
}

function getChangeStudent(doc) {
  return{
          '_id': doc._id,
        'Vorname': doc.firstName,
          'Nachname': doc.lastName,
          'Untergruppe': doc.subgroup,
          'Allergiker Essen': doc.specialFood,
          'Aktiv': doc.isActive,
        }
}

function getChangePermanentOrder(doc) {
  return{
          'Bestelltage': doc.daysOrder || 'N/A',
          '_id': doc._id,
        }
}

function getChangeVacation(doc) {
  return{
          'Urlaubsstart': doc.vacation.vacationStart || 'N/A',
          'Urlaubsende': doc.vacation.vacationEnd || 'N/A',
        }
}


module.exports = {
  logUserAction,
  getChangeTenant,
  getChangeStudent,
  getChangePermanentOrder,
  getChangeVacation
};