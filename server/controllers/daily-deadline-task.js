///addTask Customer based on deadline Order
/// add All OrdersCustomers Permanent Order -> Check if Customer has placed Order already
/// When deadline send Email to Caterer for the day, aswell to Customer with list of names?
const schedule = require("node-schedule");
const mongoose = require("mongoose");
const TaskOrder = mongoose.model('TaskOrder');
const processOrder = require('./task-daily-deadline.controller');
const scheduledJobs = {};

module.exports.addTaskOrderDeadlineCustomer = async (req, res, next) => {
// const addTaskOrderDeadlineCustomer = async (req, res, next) => {
  const tenantId = req.tenantId; // Or req.user._id, depending on your setup
  const { day, time } = req.body.order.deadLineDaily;
  const customerId = req.body.customerId;
  try {
    const task = await TaskOrder.findOneAndUpdate(
      { tenantId,customerId }, // Search condition
      { day, time, customerId }, // Fields to update
      {
        new: true, // Return the updated document
        upsert: true, // Insert if doesn't exist
        runValidators: true, // Run model validators
        setDefaultsOnInsert: true // Apply defaults on insert
      }
    );
    // Cancel the old job if it exists
    if (scheduledJobs[customerId]) {
      scheduledJobs[customerId].cancel();
    }
    console.log(`Scheduling task for tenant: ${tenantId}`);
    console.log(`Scheduling task for tenant: ${customerId}`);
    scheduledJobs[customerId] = schedule.scheduleJob(task.schedule, async function() {
      try {
        console.log(`Executing task for tenant: ${tenantId}`);
        await processOrder(customerId,tenantId);
      } catch (error) {
        console.error('Error executing scheduled task:', error);
      }
    });

    res.json({ success: true, task });
  } catch (error) {
    console.error('Error adding or updating task reminder:', error);
    res.status(500).json({ success: false, message: 'Failed to add or update task.' });
  }
};

// module.exports = addTaskOrderDeadlineCustomer;
