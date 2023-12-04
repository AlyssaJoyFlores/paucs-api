const express = require('express');
const router = express.Router()

const {authenticateUser} = require('../middleware/authentication')

const {
    register,
    verifyEmail,
    login,
    logout,
    forgotPassword,
    resetPassword
} = require('../controllers/authController')

router.route('/register').post(register)
router.route('/login').post(login)
router.route('/logout').delete(authenticateUser, logout)
router.route('/verify-email').post(verifyEmail)
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router