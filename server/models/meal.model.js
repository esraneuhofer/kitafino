var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var meal = new Schema({
  groupRaiseAmount:[{customerId:Schema.Types.ObjectId,groupId:String,amount:Number}],
  tenantId: Schema.Types.ObjectId,
  recipe:[{
    amountArticle:Number,
    _id:Schema.Types.ObjectId,
    price:Number,
    isEdited:Boolean
  }],
  calculation:String,
  specials:{},
  mealtype:String,
  type:String,
  portionSizeGroupType:[{
    groupTypeId: Schema.Types.ObjectId,
    amount:Number
  }],
  allergens:[],
  nameMeal:String,
  totalAmount:Number,
  preparation:String
});


var Meal = mongoose.model('Meal', meal);

module.exports = Meal;
//

