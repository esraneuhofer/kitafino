const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// router.use('/', tenantConfig.getTenantId);

const ctrlUser = require('../controllers/user.controller');
const ctrlTenant = require('../controllers/tenant.controller');
const ctrlGenerell = require('../controllers/generell.controller');
const ctrlStudents = require('../controllers/student.controller');
const jwtHelper = require('../config/jwtHelper');

router.post('/register', ctrlUser.register);
router.post('/authenticate', ctrlUser.authenticate);
router.get('/getUsers', ctrlUser.getUsers);
router.get('/userProfile',jwtHelper.verifyJwtToken, ctrlUser.userProfile);




// router.get('/ctrlStudents', ctrlStudents.getRegisteredStudentsUser);


router.post('/addParentTenant',jwtHelper.verifyJwtToken,ctrlTenant.addParentTenant)
router.get('/getTenantInformation',jwtHelper.verifyJwtToken,ctrlTenant.getTenantInformation)


router.post('/addStudent',jwtHelper.verifyJwtToken,ctrlStudents.addStudent)



//////Get Requests only////////
router.get('/getSettingsTenant',jwtHelper.verifyJwtToken,ctrlGenerell.getSettingsTenant)
router.get('/getCustomerInfo',jwtHelper.verifyJwtToken,ctrlGenerell.getCustomerInfo)
router.get('/getWeekplanWeek',jwtHelper.verifyJwtToken,ctrlGenerell.getWeekplanWeek)
router.get('/getMeals',jwtHelper.verifyJwtToken,ctrlGenerell.getMeals)
router.get('/getMenus',jwtHelper.verifyJwtToken,ctrlGenerell.getMenus)
router.get('/getArticleDeclaration',jwtHelper.verifyJwtToken,ctrlGenerell.getArticleDeclaration)
router.get('/getArticle',jwtHelper.verifyJwtToken,ctrlGenerell.getArticle)

module.exports = router;
