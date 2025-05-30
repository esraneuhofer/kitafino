const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); // Speicher
// router.use('/', tenantConfig.getTenantId);


const crtlFire = require('../controllers/notificationController');
const ctrlBut = require('../controllers/but.controller');
const ctrlGet = require('../controllers/get.controller');
const ctrlHelp = require('../controllers/help.controller');
const ctrlMessage = require('../controllers/message.controller');
const ctrlLanguage = require('../controllers/language.controller');
const ctrlUser = require('../controllers/user.controller');
const ctrlTenant = require('../controllers/tenant.controller');
const ctrlGenerell = require('../controllers/generell.controller');
const ctrlStudents = require('../controllers/student.controller');
const crtlAccount = require('../controllers/account.controller');
const crtlOrder = require('../controllers/order.controller');
const crtlPermanent = require('../controllers/permanent-order.controller');
const crtlPlaceOrder = require('../controllers/place-order.controller');
const ctrlCancelOrder = require('../controllers/cancel-order.controller');
const crtlStripe = require('../controllers/stripe');
const jwtHelper = require('../config/jwtHelper');
const {rawBodyBuffer} = require('../config/stripeWebhookMiddleware');
const ctrlWebhook = require('../controllers/stripe-webhook.controller');
const crtlWithdraw = require('../controllers/withdraw.controller');
const rateLimitHelper = require('../config/rateLimitHelper');
const ctrlVacation = require('../controllers/vacation.controller');




router.post('/resetPassword', ctrlUser.resetPassword);
router.post('/changePassword',jwtHelper.verifyJwtToken, ctrlUser.changePassword);
router.post('/deactivateAccount',jwtHelper.verifyJwtToken, ctrlUser.deactivateAccount);
router.post('/register', ctrlUser.register);
router.post('/authenticate',rateLimitHelper.rateLimit, ctrlUser.authenticate);
router.get('/userProfile',jwtHelper.verifyJwtToken, ctrlUser.userProfile);





router.get('/getRegisteredStudentsUser',jwtHelper.verifyJwtToken, ctrlStudents.getRegisteredStudentsUser);
router.post('/addParentTenant',jwtHelper.verifyJwtToken,ctrlTenant.addTenantAndAccount)
router.post('/editParentTenant',jwtHelper.verifyJwtToken,ctrlTenant.editParentTenant)
router.get('/getTenantInformation',jwtHelper.verifyJwtToken,ctrlTenant.getTenantInformation)


//////Student Requests////////
router.post('/addStudent',jwtHelper.verifyJwtToken,ctrlStudents.addStudent)
router.post('/editStudent',jwtHelper.verifyJwtToken,ctrlStudents.editStudent)



//////Get Requests only////////
router.get('/healthcheck',jwtHelper.verifyJwtToken,ctrlGenerell.healthcheck)
router.get('/getSettingsCaterer',jwtHelper.verifyJwtToken,ctrlGenerell.getSettingsCaterer)
router.get('/getCustomerInfo',jwtHelper.verifyJwtToken,ctrlGenerell.getCustomerInfo)
router.get('/getWeekplanWeek',jwtHelper.verifyJwtToken,ctrlGenerell.getWeekplanWeek)
router.get('/getMeals',jwtHelper.verifyJwtToken,ctrlGenerell.getMeals)
router.get('/getMenus',jwtHelper.verifyJwtToken,ctrlGenerell.getMenus)
router.get('/getArticleDeclaration',jwtHelper.verifyJwtToken,ctrlGenerell.getArticleDeclaration)
router.get('/getArticle',jwtHelper.verifyJwtToken,ctrlGenerell.getArticle)
router.get('/getWeekplanGroups',jwtHelper.verifyJwtToken,ctrlGenerell.getWeekplanGroups)
router.get('/getWeekplanGroupSelection',jwtHelper.verifyJwtToken,ctrlGenerell.getWeekplanGroupSelection)
router.get('/getAssignedWeekplan',jwtHelper.verifyJwtToken,ctrlGenerell.getAssignedWeekplan)
router.get('/getSingelWeekplanPdf',jwtHelper.verifyJwtToken,ctrlGenerell.getSingelWeekplanPdf)
router.get('/getWeekplanPdfWeek',jwtHelper.verifyJwtToken,ctrlGenerell.getWeekplanPdfWeek)
router.get('/getAllWeekplanPdf',jwtHelper.verifyJwtToken,ctrlGenerell.getAllWeekplanPdf)
router.get('/getVacationCustomer',jwtHelper.verifyJwtToken,ctrlGenerell.getVacationCustomer)
router.post('/sendFeedback',jwtHelper.verifyJwtToken,ctrlGenerell.sendFeedback)
router.post('/reportError',jwtHelper.verifyJwtToken,ctrlGenerell.reportError)


router.post('/sendEmail',jwtHelper.verifyJwtToken,ctrlGenerell.sendEmail)
router.post('/sendCSVEmail',jwtHelper.verifyJwtToken,upload.single('file'),ctrlGenerell.sendCSVEmail)
router.post('/sendPDFEmail',jwtHelper.verifyJwtToken,upload.single('file'),ctrlGenerell.sendPDFEmail)


/////Order Requests ////
router.get('/getOrderStudentDay',jwtHelper.verifyJwtToken,crtlOrder.getOrderStudentDay)
router.get('/getFutureOrders',jwtHelper.verifyJwtToken,crtlOrder.getFutureOrders)
router.get('/getFutureOrdersStudent',jwtHelper.verifyJwtToken,crtlOrder.getFutureOrdersStudent)
router.post('/addOrderStudentDay', jwtHelper.verifyJwtToken, crtlPlaceOrder.addOrderStudentDay)
router.post('/cancelOrderStudent',jwtHelper.verifyJwtToken,ctrlCancelOrder.cancelOrderStudent)

router.get('/getAccountOrderUserYear',jwtHelper.verifyJwtToken,crtlOrder.getAccountOrderUserYear)
router.get('/getAllOrdersWithCancellations',jwtHelper.verifyJwtToken,crtlOrder.getAllOrdersWithCancellations)

router.get('/getPermanentOrdersUser',jwtHelper.verifyJwtToken,crtlPermanent.getPermanentOrdersUser);
router.post('/setPermanentOrdersUser',jwtHelper.verifyJwtToken,crtlPermanent.setPermanentOrdersUser);
router.post('/editPermanentOrdersUser',jwtHelper.verifyJwtToken,crtlPermanent.editPermanentOrdersUser);
router.post('/deletePermanentOrdersUser',jwtHelper.verifyJwtToken,crtlPermanent.deletePermanentOrdersUser);


///Acoount Requests ////
router.get('/getAccountTenant',jwtHelper.verifyJwtToken,crtlAccount.getAccountTenant);
router.post('/editAccountTenant', jwtHelper.verifyJwtToken, crtlAccount.editAccountTenant);
router.post('/withdrawFunds',jwtHelper.verifyJwtToken,crtlWithdraw.withdrawFunds);
router.get('/getAccountCharges',jwtHelper.verifyJwtToken,crtlAccount.getAccountCharges);

/////Transaction Requests ////

////Permanent Orders//////
router.post('/editParentTenant',jwtHelper.verifyJwtToken,ctrlTenant.editParentTenant)
router.get('/getTenantInformation',jwtHelper.verifyJwtToken,ctrlTenant.getTenantInformation)



// router.post('/addTaskOrderDeadlineCustomer',jwtHelper.verifyJwtToken,ctrlDailyDeadline.addTaskOrderDeadlineCustomer)
router.post('/create-payment-intent', jwtHelper.verifyJwtToken, crtlStripe.createPaymentIntent);
router.post('/webhook',rawBodyBuffer ,ctrlWebhook.webhook_stripe)


////Language Requests ////

router.post('/setLanguage',ctrlLanguage.setLanguage)
router.get('/getMessages',jwtHelper.verifyJwtToken,ctrlMessage.getMessages)
router.post('/editMessage',jwtHelper.verifyJwtToken,ctrlMessage.editMessage)


////Help Requests ////
router.get('/getAllHelpPdfNames',ctrlHelp.getAllHelpPdfNames)
router.get('/getSingleHelpPdfBase',ctrlHelp.getSingleHelpPdfBase)
router.get('/getSingleHelpPdfBaseLogin',ctrlHelp.getSingleHelpPdfBaseLogin)


///BUT///

router.get('/getButTenant',jwtHelper.verifyJwtToken,ctrlBut.getButTenant)
router.get('/getSingleButDocument',jwtHelper.verifyJwtToken,ctrlBut.getSingleButDocument)
router.get('/addOrEditBut',jwtHelper.verifyJwtToken,ctrlBut.addOrEditBut)
router.post('/uploadButDocument',jwtHelper.verifyJwtToken,ctrlBut.uploadButDocument)
router.get('/getButDocumentTenant',jwtHelper.verifyJwtToken,ctrlBut.getButDocumentTenant)


///Get Only///

router.get('/getSchoolSettings',jwtHelper.verifyJwtToken,ctrlGet.getSchoolSettings)

router.post('/saveTokenFirebase',jwtHelper.verifyJwtToken,crtlFire.saveTokenFirebase)
router.post('/deleteSpecificTokenFirebase',jwtHelper.verifyJwtToken,crtlFire.deleteSpecificTokenFirebase)

// router.get('/sendPushNotification',crtlFire.sendPushNotification)

///Vacation Requests///
router.get('/getAllVacationParentByUserId', jwtHelper.verifyJwtToken, ctrlVacation.getAllVacationParentByUserId);
router.get('/getAllVacationStudentByStudentId', jwtHelper.verifyJwtToken, ctrlVacation.getAllVacationStudentByStudentId);
router.post('/addVacation', jwtHelper.verifyJwtToken, ctrlVacation.addVacation);
router.post('/deleteVacation', jwtHelper.verifyJwtToken, ctrlVacation.deleteVacation);


module.exports = router;


