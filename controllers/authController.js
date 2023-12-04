const User = require('../models/usersModel')
const Token = require('../models/tokenModel')
const CustomError = require('../errors')
const crypto = require('crypto')
const {StatusCodes} = require('http-status-codes')
const { attachedCookiesToResponse, createTokenUser, sendVerificationEmail, sendResetPasswordEmail, createHash} = require('../utils')



const register = async (req, res) => {
    const {
        school_id,
        school_email,
        password,
        school_campus,
        college_dept,
        full_name,
        course,
        year,
        section,
        gender,
        birthdate,
        address,
        orf_image,
        profile_image
    } = req.body;

    const emailExist = await User.findOne({ school_email });
    if (emailExist) {
        throw new CustomError.BadRequestError('Email Already Exist');
    }

    const firstAccount = await User.countDocuments({}) === 0;
    const role = firstAccount? 'admin' : 'student';

    //verification for email
    // this is the token for confirmation email
    // importing node package crypto to hash token
    const verificationToken = crypto.randomBytes(40).toString('hex');

    let user;

    if (firstAccount === 'admin') {
        // If the role is admin, create an admin user
        const { school_email, password, full_name } = req.body;
        user = await User.create({
            school_email,
            password,
            full_name,
            profile_image,
            gender,
            birthdate,
            address,
            role: 'admin',
            verificationToken
        });
    } else {
        // If the role is student, create a student user
        user = await User.create({
            school_id,
            school_email,
            password,
            school_campus,
            college_dept,
            full_name,
            course,
            year,
            section,
            gender,
            birthdate,
            address,
            orf_image,
            profile_image,
            role,
            verificationToken
        });
    }

    const origin = 'http://localhost:3000'

    //after creating the user now it will validate/confirm email
    //sending email
    await sendVerificationEmail({
        name: user.full_name,
        school_email: user.school_email,
        verificationToken: user.verificationToken,
        origin
    })

    res.status(StatusCodes.CREATED).json({ msg: 'Please check you email to verify your account'});
};


const verifyEmail =  async(req, res) => {
    const {verificationToken, school_email} = req.body;

    //check user using email, if not exist the throw error
    const user = await User.findOne({school_email})
    if(!user){
        throw new CustomError.UnauthenticatedError('Verification Failed')
    }

    if(user.verificationToken !== verificationToken){
        throw new CustomError.UnauthenticatedError('Verification failed')
    }

    //if correct set
    user.isVerified = true
    user.verified = Date.now()
    user.verificationToken = ''
    await user.save()


    res.status(StatusCodes.OK).json({mag: 'Email Verified'});
}





const login = async(req, res)=> {
    const {school_email, password} = req.body

    // check if email and password exist in db
    if(!school_email || !password) {
        throw new CustomError.BadRequestError('Please provide email or password')
    }

    //check user if exist in db, if not throw error
    const user = await User.findOne({school_email})
    if(!user) {
        throw new CustomError.UnauthenticatedError('Invalid Credentials, User not found')
    }

    //check if password correct, if not throw error
    const isPasswordCorrect = await user.comparePassword(password) 
    if(!isPasswordCorrect) {
        throw new CustomError.UnauthenticatedError('Invalid Credentials, wrong password')
    }

    //check if user is verified or already verified its email, if not throw error
    if(!user.isVerified) {
        throw new CustomError.UnauthenticatedError('Please verify your email');
    };

    const tokenUser = createTokenUser(user); //{name:user.name, userId:user._id, role:user.role}


    //setup token for refreash and access
    // refreshToken
    let refreshToken = '';

    //check for existing refreshtoken
    const existingToken = await Token.findOne({
        user:user._id
    });

    if(existingToken){
        const {isValid} = existingToken
        if(!isValid){
            throw new CustomError.UnauthenticatedError('Invalid Credentials')
        }

        refreshToken = existingToken.refreshToken;
        attachedCookiesToResponse({res, user:tokenUser, refreshToken})
        res.status(StatusCodes.OK).json({msg: 'login user', user:tokenUser})
        return
    }


    
    //setup token
    refreshToken = crypto.randomBytes(40).toString('hex')
    const userAgent = req.headers['user-agent']
    const ip = req.ip
    const userToken = {refreshToken, userAgent, ip, user:user._id}
    //token create
    await Token.create(userToken)



    attachedCookiesToResponse({ res, user: tokenUser, refreshToken})

    


    res.status(StatusCodes.OK).json({msg: 'login user', user:tokenUser})
}




const logout = async(req, res)=> {

    await Token.findOneAndDelete({user: req.user.userId})

    res.cookie('accessToken', 'logout',{
        httpOnly:true,
        expires: new Date(Date.now() + 1000),
    })

    res.cookie('refreshToken', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now() + 1000),
    });

    res.status(StatusCodes.OK).json({msg: 'logout user'})
}


const forgotPassword = async(req, res) => {
    const {school_email} = req.body
    if (!school_email) {
        throw new CustomError.BadRequestError('Please provide valid school email');
    
      }
    
      const user = await User.findOne({ school_email })
    
      if(!user){
        throw new CustomError.UnauthenticatedError('Invalid Credentials');
      }
    
    
      if(user){
        const passwordToken = crypto.randomBytes(70).toString('hex')
        // send email  [miliseconds/seconds/minutes]
    
        const origin = 'http://localhost:3000'
        await sendResetPasswordEmail({
          name:user.full_name, 
          school_email:user.school_email, 
          token:passwordToken, 
          origin
        })
    
    
        const tenMinutes = 1000 * 60 * 10
        const passwordTokenExpirationDate = new Date(Date.now() + tenMinutes)
    
        user.passwordToken = createHash(passwordToken)
        user.passwordTokenExpirationDate = passwordTokenExpirationDate
    
        await user.save()
    
      }
    
    
      res.status(StatusCodes.OK).json({msg: 'Please check your email for reset password link'})
}



const resetPassword = async(req, res) => {
    const {token, school_email, password} = req.body
  
    if (!token || !school_email || !password) {
        throw new CustomError.BadRequestError('Please provide all values');
  
    }
  
    const user = await User.findOne({school_email})
    if(user){
        const currentDate = new Date()
        if(user.passwordToken === createHash(token) && user.passwordTokenExpirationDate > currentDate){
            user.password = password
            user.passwordToken = null
            user.passwordTokenExpirationDate = null
            await user.save()
        }
    }
  
    res.status(StatusCodes.OK).json({msg: 'reset password'})
    
}



module.exports = {
    register,
    verifyEmail,
    login,
    logout,
    forgotPassword,
    resetPassword
}