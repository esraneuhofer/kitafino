const mongoose = require('mongoose');
const VacationStudent = mongoose.model('VacationStudent');
const {sendMonitoringEmail} = require('./order-functions');

// Get all vacations for a user
module.exports.getAllVacationParentByUserId = async (req, res) => {
  try {
    const userId = req._id;
    
    // Find all vacations for the user and return them directly
    const vacations = await VacationStudent.find({ userId: userId }).sort({ 'vacation.vacationStart': -1 });
    
    // Return just the vacations array
    return res.status(200).json(vacations);
  } catch (err) {
    console.error('Error fetching vacations:', err);
    return res.status(500).json({
      status: false,
      message: 'Server error while fetching vacations'
    });
  }
};

// Get all vacations for a user
module.exports.getAllVacationStudentByStudentId = async (req, res) => {
  try {
    const studentId = req.query.studentId;
    console.log('studentId', studentId);
    if (!studentId) {
      // Bei fehlendem studentId ein leeres Array zurückgeben
      return res.status(200).json([]);
    }
    // Find all vacations for the user and return them directly
    const vacations = await VacationStudent.find({ studentId: studentId }).sort({ 'vacation.vacationStart': -1 });
    
    // Return just the vacations array
    return res.status(200).json(vacations);
  } catch (err) {
    console.error('Error fetching vacations:', err);
    // Bei einem Fehler ein leeres Array zurückgeben
    return res.status(200).json([]);
  }
};


module.exports.addVacation = async (req, res) => {
  try {
    const userId = req._id;
    req.userId = userId;
    const { startDate, endDate, studentId } = req.body;
    
    // Validierungs-Fehler abfangen und Benachrichtigung senden
    if (!startDate) {
      await sendMonitoringEmail(req, new Error('Start date is required'), 'addvacation_validation');
      return res.status(400).json('Start date is required');
    }
    
    if(!studentId) {
      await sendMonitoringEmail(req, new Error('Student ID is required'), 'addvacation_validation');
      return res.status(400).json('Student ID is required');
    }
    
    // Convert string dates to Date objects
    const vacationStart = new Date(startDate);
    // endDate can be null
    const vacationEnd = endDate ? new Date(endDate) : null;
    
    // Only validate date range if endDate is provided
    if (vacationEnd && vacationEnd < vacationStart) {
      await sendMonitoringEmail(req, new Error('End date must be after start date'), 'addvacation_validation');
      return res.status(400).json('End date must be after start date');
    }
    
    // Create a new vacation entry
    const vacation = new VacationStudent({
      userId: userId,
      studentId: studentId,
      customerId: req.customerId || null,
      vacation: {
        vacationStart: vacationStart,
        vacationEnd: vacationEnd
      }
    });
    
    // Save to database
    await vacation.save();
    
    // Erfolgreich gespeichert
    return res.status(201).json(vacation);
  } catch (err) {
    console.error('Error adding vacation:', err);
    // Send monitoring email on error
    await sendMonitoringEmail(req, err, 'addvacation_server_error'); 
    return res.status(500).json('Server error while adding vacation');
  }
};

// Delete a vacation
module.exports.deleteVacation = async (req, res) => {
  try {
    const userId = req._id;
    const { id } = req.body;
    
    // Validate input
    if (!id) {
      return res.status(400).json('Vacation ID is required');
    }
    
    // Find and delete the vacation, ensuring it belongs to the current user
    const result = await VacationStudent.findOneAndDelete({
      _id: id,
      userId: userId
    });
    
    // Check if vacation was found and deleted
    if (!result) {
      return res.status(404).json('Vacation not found or you do not have permission to delete it');
    }
    
    return res.status(200).json('Vacation deleted successfully');
  } catch (err) {
    console.error('Error deleting vacation:', err);
    return res.status(500).json('Server error while deleting vacation');
  }
};