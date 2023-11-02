const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// router.use('/', tenantConfig.getTenantId);

const ctrlUser = require('../controllers/user.controller');
const ctrlStudents = require('../controllers/student.controller');
crtlTenant = require('../controllers/tenant.controller');
const jwtHelper = require('../config/jwtHelper');

router.post('/register', ctrlUser.register);
router.post('/authenticate', ctrlUser.authenticate);
router.get('/getUsers', ctrlUser.getUsers);
router.get('/userProfile', ctrlUser.userProfile);




router.get('/ctrlStudents', ctrlStudents.getRegisteredStudentsUser);


// router.get('/getTenantInformation',crtlTenant.getTenantInformation)


module.exports = router;
