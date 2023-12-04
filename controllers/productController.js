const Product = require('../models/productModel')
const User = require('../models/usersModel')
const asyncHandler = require('express-async-handler')
const cloudinary = require('cloudinary').v2;
const fs = require('fs')
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');

const getAllProducts = async(req, res)=> {
    const getProducts = await Product.find()
    res.status(StatusCodes.OK).json({msg: "get all products", getProducts})
}

const getSingleProduct = async(req, res) => {
    const product = await Product.findById(req.params.id)
    if(!product){
        throw new CustomError.NotFoundError('Product not found')
    }
    res.status(StatusCodes.OK).json({product})
}



const addProduct = async(req, res)=> {

    const {prod_department, prod_status, image, prod_name, prod_desc, prod_price, categories} = req.body

    if(!prod_department || !prod_status || !prod_name || !prod_desc || !prod_price || !categories){
        throw new CustomError.BadRequestError('All fields are required')
    }

    const admin = await User.findById(req.user.userId);

    if (!admin) {
        throw new CustomError.NotFoundError('Admin not found')
    }
 

    const product = await Product.create({
        prod_department, 
        prod_status, 
        image, 
        prod_name, 
        prod_desc, 
        prod_price, 
        categories,
        user: req.user.userId
    })

    res.status(StatusCodes.CREATED).json({msg: "create product!", product})
}



const updateProduct = async(req, res)=> {
    const product = await Product.findById(req.params.id)

    if(!product){
        throw new CustomError.NotFoundError('Product not found')
    }

    const updateProduct = await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        {new:true}
    )

    res.status(StatusCodes.OK).json({msg: "update product", updateProduct})
}



const deleteProduct = async(req, res)=> {
    const product = await Product.findById(req.params.id);

    if (!product) {
        throw new CustomError.NotFoundError('Product not found')
    }

   
    try {
        if (product.image) {
            const publicId = product.image.match(/\/v\d+\/(.+?)\./)[1];
            await cloudinary.uploader.destroy(publicId);
        }
    } catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
    }

    await Product.deleteOne({ _id:product});

    res.status(StatusCodes.OK).json({ message: "Product deleted", product });
}



const uploadProdImage = async(req, res)=> {
    const result = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
        use_filename:true,
        folder:'product-folder'
    })

    fs.unlinkSync(req.files.image.tempFilePath)

    return res.status(StatusCodes.OK).json({image:{src:result.secure_url}})
}


const updateProdImage = async(req, res)=> {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return res.status(404).json({ error: "No product found" });
    }

    try {
        if (product.image) {
            const publicId = product.image.match(/\/v\d+\/(.+?)\./)[1];
            await cloudinary.uploader.destroy(publicId);
        }
    } catch (error) {
        console.error("Error deleting existing image from Cloudinary:", error);
    }

    const result = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
        use_filename: true,
        folder: 'product-folder'
    });


    fs.unlinkSync(req.files.image.tempFilePath);

    return res.status(StatusCodes.OK).json({ image: { src: result.secure_url } });
}


module.exports = {
    getAllProducts,
    getSingleProduct,
    addProduct,
    updateProduct,
    deleteProduct,
    uploadProdImage,
    updateProdImage
}