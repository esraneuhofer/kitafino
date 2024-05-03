const schedule = require("node-schedule");
const mongoose = require("mongoose");
const processOrder = require("./task-daily-deadline.controller");
const TaskOrder = mongoose.model('TaskOrder');

const scheduledJobs = {};

async function loadAndScheduleCustomersOrders() {
  console.log('Loading and scheduling tasks...');

  try {
    const tasks = await TaskOrder.find(); // Attempt to fetch tasks

    tasks.forEach(task => {
      try {
        // Verify that task.tenantId and task.customerId are defined
        if (!task.tenantId || !task.customerId) {
          throw new Error("Missing tenantId or customerId in task data.");
        }

        const { tenantId, customerId } = task;

        // If there's already a scheduled job for the tenant, cancel it
        if (scheduledJobs[customerId]) {
          scheduledJobs[customerId].cancel();
        }

        // Schedule the new job and save it in the scheduledJobs object
        scheduledJobs[customerId] = schedule.scheduleJob(task.schedule, async function() {
          try {
            console.log(`Executing task for tenant: ${tenantId}`);
            await processOrder(customerId, tenantId);
          } catch (error) {
            console.error('Error executing scheduled task:', error);
          }
        });

      } catch (error) {
        console.error('Error preparing task scheduling:', error);
      }
    });

  } catch (error) {
    console.error('Error loading tasks:', error);
  }
}
