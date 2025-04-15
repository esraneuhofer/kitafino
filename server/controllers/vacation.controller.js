const mongoose = require('mongoose');
const VacationStudent = mongoose.model('VacationStudent');

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

module.exports.addVacation = async (req, res) => {
  try {
    const userId = req._id;
    const { startDate, endDate } = req.body;
    
    // Validate input data - only startDate is required
    if (!startDate) {
      return res.status(400).json('Start date is required');
    }
    
    // Convert string dates to Date objects
    const vacationStart = new Date(startDate);
    // endDate can be null
    const vacationEnd = endDate ? new Date(endDate) : null;
    
    // Only validate date range if endDate is provided
    if (vacationEnd && vacationEnd < vacationStart) {
      return res.status(400).json('End date must be after start date');
    }
    
    // Create a new vacation entry
    const vacation = new VacationStudent({
      userId: userId,
      tenantId: req.tenantId || null,
      customerId: req.customerId || null,
      vacation: {
        vacationStart: vacationStart,
        vacationEnd: vacationEnd
      }
    });
    
    // Save to database
    await vacation.save();
    
    return res.status(201).json(vacation);
  } catch (err) {
    console.error('Error adding vacation:', err);
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