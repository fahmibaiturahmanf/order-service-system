const express = require('express');
const router = express.Router();
const userAuth = require('../controllers/userAuthController');
const userUpdateController = require('../controllers/userUpdateController');
const { authenticate, authorizeRole } = require('../Middleware/authMiddleware'); 

// Rute yang tidak memerlukan otentikasi token
router.post('/register', userAuth.registerUser);
router.post('/login', userAuth.loginUser);
router.post('/reset-password-request', userAuth.resetPasswordRequestUser);
router.post('/reset-password', userAuth.resetPasswordUser);

// Rute yang memerlukan token login user
router.put('/update-profile', authenticate, userUpdateController.updateProfileUser);

//kirim email ke admin meeting
router.post('/send-meeting-email', userAuth.kirimEmailMeeting);

module.exports = router;
