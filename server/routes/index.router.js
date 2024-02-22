const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// router.use('/', tenantConfig.getTenantId);

const ctrlUser = require('../controllers/user.controller');
const ctrlTenant = require('../controllers/tenant.controller');
const ctrlGenerell = require('../controllers/generell.controller');
const ctrlStudents = require('../controllers/student.controller');
const crtlAccount = require('../controllers/account.controller');
const crtlOrder = require('../controllers/order.controller');
const crtlTransaction = require('../controllers/transaction.controller');

const jwtHelper = require('../config/jwtHelper');

router.post('/register', ctrlUser.register);
router.post('/authenticate', ctrlUser.authenticate);
router.get('/getUsers', ctrlUser.getUsers);
router.get('/userProfile',jwtHelper.verifyJwtToken, ctrlUser.userProfile);




router.get('/getRegisteredStudentsUser',jwtHelper.verifyJwtToken, ctrlStudents.getRegisteredStudentsUser);


router.post('/addParentTenant',jwtHelper.verifyJwtToken,ctrlTenant.addParentTenant)
router.post('/editParentTenant',jwtHelper.verifyJwtToken,ctrlTenant.editParentTenant)
router.get('/getTenantInformation',jwtHelper.verifyJwtToken,ctrlTenant.getTenantInformation)

//////Student Requests////////
router.post('/addStudent',jwtHelper.verifyJwtToken,ctrlStudents.addStudent)
router.post('/editStudent',jwtHelper.verifyJwtToken,ctrlStudents.editStudent)



//////Get Requests only////////
router.get('/getSettingsCaterer',jwtHelper.verifyJwtToken,ctrlGenerell.getSettingsCaterer)
router.get('/getCustomerInfo',jwtHelper.verifyJwtToken,ctrlGenerell.getCustomerInfo)
router.get('/getWeekplanWeek',jwtHelper.verifyJwtToken,ctrlGenerell.getWeekplanWeek)
router.get('/getMeals',jwtHelper.verifyJwtToken,ctrlGenerell.getMeals)
router.get('/getMenus',jwtHelper.verifyJwtToken,ctrlGenerell.getMenus)
router.get('/getArticleDeclaration',jwtHelper.verifyJwtToken,ctrlGenerell.getArticleDeclaration)
router.get('/getArticle',jwtHelper.verifyJwtToken,ctrlGenerell.getArticle)
router.get('/getWeekplanGroups',jwtHelper.verifyJwtToken,ctrlGenerell.getWeekplanGroups)
router.get('/getAssignedWeekplan',jwtHelper.verifyJwtToken,ctrlGenerell.getAssignedWeekplan)
router.get('/getSingelWeekplanPdf',jwtHelper.verifyJwtToken,ctrlGenerell.getSingelWeekplanPdf)
router.get('/getAllWeekplanPdf',jwtHelper.verifyJwtToken,ctrlGenerell.getAllWeekplanPdf)
router.get('/getVacationCustomer',jwtHelper.verifyJwtToken,ctrlGenerell.getVacationCustomer)


router.post('/sendEmail',jwtHelper.verifyJwtToken,ctrlGenerell.sendEmail)


/////Order Requests ////
router.get('/getOrderStudentDay',jwtHelper.verifyJwtToken,crtlOrder.getOrderStudentDay)
router.get('/getOrderStudentYear',jwtHelper.verifyJwtToken,crtlOrder.getOrderStudentYear)
router.post('/addOrderStudentDay',jwtHelper.verifyJwtToken,crtlOrder.addOrderStudentDay)
router.post('/cancelOrderStudent',jwtHelper.verifyJwtToken,crtlOrder.cancelOrderStudent)
router.post('/editStudentOrder',jwtHelper.verifyJwtToken,crtlOrder.editStudentOrder)

router.get('/getAccountOrderUserYear',jwtHelper.verifyJwtToken,crtlOrder.getAccountOrderUserYear)



///Acoount Requests ////
router.get('/getAccountTenant',jwtHelper.verifyJwtToken,crtlAccount.getAccountTenant);
router.post('/addAccountChargesTenant',jwtHelper.verifyJwtToken,crtlAccount.addAccountChargesTenant);
router.get('/getAccountCharges',jwtHelper.verifyJwtToken,crtlAccount.getAccountCharges);

/////Transaction Requests ////
router.get('/getTransactionTenant',jwtHelper.verifyJwtToken,crtlTransaction.getTransactionTenant);


module.exports = router;


