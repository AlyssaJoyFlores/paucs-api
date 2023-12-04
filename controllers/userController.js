const Users = require('../models/usersModel')
const CustomError = require('../errors')
const {StatusCodes} = require('http-status-codes')
const { attachedCookiesToResponse, createTokenUser} = require('../utils')

const getAllUsers = async(req, res) => {
    const users = await Users.find()

    res.status(StatusCodes.OK).json({users})
}

const getSingleUser = async(req, res) => {
    res.status(StatusCodes.OK).json({msg: 'get single user'})
}


const showCurrentUser = async(req, res) => {
    res.status(StatusCodes.OK).json({ user: req.user });
}


const updateUser = async(req, res) => {
    res.status(StatusCodes.OK).json({msg: 'update user'})
}


const updateUserPassword = async(req, res) => {
    res.status(StatusCodes.OK).json({msg: 'update user password'})
}


module.exports = {
    getAllUsers,
    getSingleUser,
    showCurrentUser,
    updateUser,
    updateUserPassword
}