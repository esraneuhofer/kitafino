const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
// Set up storage engine for multer with memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


// Logging Middleware
router.use((req, res, next) => {
  console.log(`Received ${req.method} request for '${req.url}'`);
  next();
});

// router.use('/', tenantConfig.getTenantId);

const ctrlHelp = require('../controllers/help.controller');
const ctrlMessage = require('../controllers/message.controller');
const ctrlLanguage = require('../controllers/language.controller');
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
const crtlStripe = require('../controllers/stripe');
const jwtHelper = require('../config/jwtHelper');
const {rawBodyBuffer} = require('../config/stripeWebhookMiddleware');
const ctrlWebhook = require('../controllers/stripe-webhook.controller');
const rateLimitHelper = require('../config/rateLimitHelper');




router.post('/resetPassword', ctrlUser.resetPassword);
router.post('/deactivateAccount',jwtHelper.verifyJwtToken, ctrlUser.deactivateAccount);
router.post('/register', ctrlUser.register);
router.post('/authenticate',rateLimitHelper.rateLimit, ctrlUser.authenticate);
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
router.get('/getWeekplanPdfWeek',jwtHelper.verifyJwtToken,ctrlGenerell.getWeekplanPdfWeek)
router.get('/getAllWeekplanPdf',jwtHelper.verifyJwtToken,ctrlGenerell.getAllWeekplanPdf)
router.get('/getVacationCustomer',jwtHelper.verifyJwtToken,ctrlGenerell.getVacationCustomer)


router.post('/sendEmail',jwtHelper.verifyJwtToken,ctrlGenerell.sendEmail)
router.post('/sendCSVEmail',jwtHelper.verifyJwtToken,upload.single('file'),ctrlGenerell.sendCSVEmail)


/////Order Requests ////
router.get('/getOrderStudentWeek',jwtHelper.verifyJwtToken,crtlOrder.getOrderStudentWeek)
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



// router.post('/addTaskOrderDeadlineCustomer',jwtHelper.verifyJwtToken,ctrlDailyDeadline.addTaskOrderDeadlineCustomer)
router.post('/create-payment-intent', jwtHelper.verifyJwtToken, crtlStripe.createPaymentIntent);

router.post('/webhook',rawBodyBuffer ,ctrlWebhook.webhook_stripe)


////Language Requests ////

router.post('/setLanguage',ctrlLanguage.setLanguage)
router.get('/getMessages',ctrlMessage.getMessages)
router.post('/editMessage',ctrlMessage.editMessage)
router.post('/addMessage',ctrlMessage.addMessage)


////Help Requests ////

// router.post('/addHelpImage',ctrlHelp.addHelpImage)
router.get('/getAllHelpPdfNames',ctrlHelp.getAllHelpPdfNames)
router.get('/getSingleHelpPdfBase',ctrlHelp.getSingleHelpPdfBase)
router.post('/addHelpImage', jwtHelper.verifyJwtToken, upload.single('pdf'), ctrlHelp.addHelpImage);
router.get('/download/:id', jwtHelper.verifyJwtToken, ctrlHelp.downloadHelpImage);

module.exports = router;


