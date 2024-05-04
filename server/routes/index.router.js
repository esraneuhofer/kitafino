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
const crtlPermanent = require('../controllers/permanent-order.controller');
const ctrlTest = require('../controllers/task-daily-deadline.controller');
const ctrlDailyDeadline = require('../controllers/daily-deadline-task');
const crtlPlaceOrder = require('../controllers/place-order.controller');
const ctrlCancelOrder = require('../controllers/cancel-order.controller');

const jwtHelper = require('../config/jwtHelper');

router.post('/register', ctrlUser.register);
router.post('/authenticate', ctrlUser.authenticate);
router.get('/getUsers', ctrlUser.getUsers);
router.get('/userProfile',jwtHelper.verifyJwtToken, ctrlUser.userProfile);




router.get('/getRegisteredStudentsUser',jwtHelper.verifyJwtToken, ctrlStudents.getRegisteredStudentsUser);


router.post('/addParentTenant',jwtHelper.verifyJwtToken,ctrlTenant.addTenantAndAccount)
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
// router.post('/addOrderStudentDay',jwtHelper.verifyJwtToken,crtlOrder.addOrderStudentDay)
router.post('/addOrderStudentDay', jwtHelper.verifyJwtToken, crtlPlaceOrder.addOrderStudentDay)

router.post('/cancelOrderStudent',jwtHelper.verifyJwtToken,ctrlCancelOrder.cancelOrderStudent)

router.get('/getAccountOrderUserYear',jwtHelper.verifyJwtToken,crtlOrder.getAccountOrderUserYear)

router.get('/getPermanentOrdersUser',jwtHelper.verifyJwtToken,crtlPermanent.getPermanentOrdersUser);
router.post('/setPermanentOrdersUser',jwtHelper.verifyJwtToken,crtlPermanent.setPermanentOrdersUser);
router.post('/editPermanentOrdersUser',jwtHelper.verifyJwtToken,crtlPermanent.editPermanentOrdersUser);
router.post('/deletePermanentOrdersUser',jwtHelper.verifyJwtToken,crtlPermanent.deletePermanentOrdersUser);


///Acoount Requests ////
router.get('/getAccountTenant',jwtHelper.verifyJwtToken,crtlAccount.getAccountTenant);
router.post('/addAccountChargesTenant',jwtHelper.verifyJwtToken,crtlAccount.addAccountChargesTenant);
router.get('/getAccountCharges',jwtHelper.verifyJwtToken,crtlAccount.getAccountCharges);

/////Transaction Requests ////
router.get('/getTransactionTenant',jwtHelper.verifyJwtToken,crtlTransaction.getTransactionTenant);

////Permanent Orders//////
router.post('/editParentTenant',jwtHelper.verifyJwtToken,ctrlTenant.editParentTenant)
router.get('/getTenantInformation',jwtHelper.verifyJwtToken,ctrlTenant.getTenantInformation)



router.post('/addTaskOrderDeadlineCustomer',jwtHelper.verifyJwtToken,ctrlDailyDeadline.addTaskOrderDeadlineCustomer)

module.exports = router;


