const express = require('express');
const router = express.Router()


//import validation for protected routes
const {authenticateUser, authorizePermissions} = require('../middleware/authentication')

const {
    getAllUsers,
    getSingleUser,
    showCurrentUser,
    updateUser,
    updateUserPassword
} = require('../controllers/userController')

router.route('/getAllUsers').get(getAllUsers)
router.route('/showMe').get(authenticateUser, showCurrentUser)
router.route('/updateUser').patch(updateUser)
router.route('/updateUserPassword').patch(updateUserPassword)

router.route('/singleUser/:id').get(getSingleUser)





module.exports = router