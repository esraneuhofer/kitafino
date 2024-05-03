const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  tenantId: {type: String, required: true},
  customerId: {type: String, required: true},
  schedule: String, // Cron format
  day: Number,
  time: Date,
});

// Pre-save hook
// Pre-save hook for 'findOneAndUpdate'
taskSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();

  // Check if day or time is being updated using traditional approach
  let date;

  if (update.$set && update.$set.time !== undefined) {
    date = new Date(update.$set.time);
  } else {
    date = new Date(this._update.time);
  }

  if (date !== undefined) {
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();

    // Construct the cron format string
    const schedule = `${minutes} ${hours} * * *`;

    // Ensure update.$set exists to prevent runtime errors
    if (!update.$set) update.$set = {};

    // Set the schedule in the update
    update.$set.schedule = schedule;
  }

  next();
});



const TaskOrder = mongoose.model('TaskOrder', taskSchema);

module.exports = TaskOrder;
