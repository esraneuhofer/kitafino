var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var weekplanGroupSelection = new Schema({
  tenantId: Schema.Types.ObjectId,
  groupsWeekplanGroupSelection: [{
    nameCustomer: {type: String, required: true},
    customerId: Schema.Types.ObjectId,
  }],
  nameWeekplanGroupSelection: {type: String, required: true},
  weekplanGroupAllowedSelection: [{
    idSpecial: {type: String, required: true},
    selected: {type: Boolean, required: true}

  }]
});

var WeekplanGroupSelection = mongoose.model('WeekplanGroupSelection', weekplanGroupSelection);

module.exports = WeekplanGroupSelection;
