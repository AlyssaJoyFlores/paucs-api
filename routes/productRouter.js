const express = require('express')
const router = express.Router()

// for authentication and permission
const {authenticateUser, authorizePermissions} = require('../middleware/authentication')

const {
    getAllProducts,
    getSingleProduct,
    addProduct,
    updateProduct,
    deleteProduct,
    uploadProdImage,
    updateProdImage
} = require('../controllers/productController')


router.route('/getProducts').get(authenticateUser ,getAllProducts);
router.route('/uploadProdImage').post(uploadProdImage);
router.route('/addProduct').post([authenticateUser, authorizePermissions('admin')], addProduct);
router.route('/getSingleProduct/:id').get([authenticateUser, authorizePermissions('admin')],getSingleProduct);
router.route('/updateProdImage/:id').post([authenticateUser, authorizePermissions('admin')],updateProdImage);
router.route('/updateProduct/:id').patch([authenticateUser, authorizePermissions('admin')], updateProduct);
router.route('/deleteProduct/:id').delete([authenticateUser, authorizePermissions('admin')], deleteProduct);


module.exports = router