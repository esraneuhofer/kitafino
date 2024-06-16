const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

var orderStudentSchema = new Schema({
  tenantId: Schema.Types.ObjectId,
  customerId: Schema.Types.ObjectId,
  userId: Schema.Types.ObjectId,
  kw: { type: Number, required: '{PATH} is required!' },
  year: { type: Number, required: '{PATH} is required!' },
  order: {},
  studentId: Schema.Types.ObjectId,
  dateOrder: { type: String, required: '{PATH} is required!' },
  dateOrderPlaced: Date,
  postInfo: [
    {
      postId: Schema.Types.ObjectId,
      postDate: String
    }
  ],
  orderId: Schema.Types.ObjectId,
});

// Utility function to set the date to 00:00:00.000 in Europe/Berlin timezone
function setUniformTime(date) {
  return dayjs(date).tz('Europe/Berlin').startOf('day').toDate();
}

orderStudentSchema.pre('save', async function (next) {
  try {
    this.dateOrderPlaced = new Date();
    if (this.dateOrder) {
      this.dateOrder = setUniformTime(this.dateOrder);
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Creating a unique compound index
orderStudentSchema.index({ studentId: 1, dateOrder: 1 }, { unique: true });

var OrderStudent = mongoose.model('OrderStudent', orderStudentSchema);

module.exports = OrderStudent;
