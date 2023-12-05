const express = require('express');
const router = express.Router()

const {authenticateUser, authorizePermissions} = require('../middleware/authentication')

const {
    register,
    verifyEmail,
    loginStudent,
    loginAdmin,
    logout,
    forgotPassword,
    resetPassword
} = require('../controllers/authController')

router.route('/register').post(register)
router.route('/loginStudent').post(loginStudent)
router.route('/loginAdmin').post(loginAdmin)
router.route('/logout').delete(authenticateUser, logout)
router.route('/verify-email').post(verifyEmail)
router.route('/forgot-password').post(forgotPassword);
router.route('/reset-password').post(resetPassword);

module.exports = router