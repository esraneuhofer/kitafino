///addTask Customer based on deadline Order
/// add All OrdersCustomers Permanent Order -> Check if Customer has placed Order already
/// When deadline send Email to Caterer for the day, aswell to Customer with list of names?
const schedule = require("node-schedule");
const mongoose = require("mongoose");
const TaskOrder = mongoose.model('TaskOrder');
const addTaskAddOrder = require('./task-daily-deadline.controller');
const scheduledJobs = {};

const addTaskReminder = async (req, res, next) => {
  const tenantId = req._id; // Or req.user._id, depending on your setup
  const { day, time, customerId } = req.body;

  try {
    const task = await TaskOrder.findOneAndUpdate(
      { tenantId: tenantId }, // Search condition
      { day, time, tenantId }, // Fields to update
      {
        new: true, // Return the updated document
        upsert: true, // Insert if doesn't exist
        runValidators: true, // Run model validators
        setDefaultsOnInsert: true // Apply defaults on insert
      }
    );
    // Cancel the old job if it exists
    if (scheduledJobs[tenantId]) {
      scheduledJobs[tenantId].cancel();
    }

    scheduledJobs[customerId] = schedule.scheduleJob(task.schedule, async function() {
      try {
        console.log(`Executing task for tenant: ${tenantId}`);
        await addTaskAddOrder(customerId,tenantId);
      } catch (error) {
        console.error('Error executing scheduled task:', error);
      }
    });

    res.json(task);
  } catch (error) {
    console.error('Error adding or updating task reminder:', error);
    res.status(500).send(error);
  }
};

