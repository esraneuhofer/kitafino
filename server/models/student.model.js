var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var student = new Schema({
  mandatsreferenz:String,
  ganztag:String,
  edited:Boolean,
  customerNumber:String,
  editedDate:[{change:String,changeConfirmed:Boolean}],
  contractConfirmed:Boolean,
  active:Boolean,
  tenantId:Schema.Types.ObjectId,
  projectId:Schema.Types.ObjectId,
  userId:Schema.Types.ObjectId,
  nameStudent: String,
  nameContractPartner: String,
  street: String,
  city_zip: String,
  phone: String,
  email: String,
  orderFix:String,
  selectedDays:[],
  subscription: String,
  bildungTeilhabe: {
    dateBuTDocumentIssued:Date,
    dateAddBut:String,
    hasBuT: Boolean,
    buTConfirmed:Boolean,
    begin: String,
    end: String,
    documents: []
  },
  bildungTeilhabeOld:[{
    dateBuTDocumentIssued:Date,
    dateAddBut:String,
    begin: String,
    end: String,
  }],
  specialDiet: String,
  payment: {
    accountOwner: String,
    bic: String,
    iban: String,
  },
  beginContractWish: String,
  beginContractConfirm: String,
  endContractConfirm: String,
  dateSignContract: String,
});

var Student = mongoose.model('Student', student);

module.exports = Student;

