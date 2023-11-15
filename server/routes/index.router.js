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
router.get('/getSettingsTenant',jwtHelper.verifyJwtToken,ctrlGenerell.getSettingsTenant)

router.post('/addStudent',jwtHelper.verifyJwtToken,ctrlStudents.addStudent)



module.exports = router;
