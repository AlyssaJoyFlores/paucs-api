// check token
//for jwt
//for protected routes

const CustomError = require('../errors')
const  {isTokenValid} = require('../utils')
const Token = require('../models/tokenModel');

const { attachedCookiesToResponse } = require('../utils');

const authenticateUser = async (req, res, next) => {
    const { refreshToken, accessToken } = req.signedCookies;
  
    try {
        if (accessToken) {
            const payload = isTokenValid(accessToken);
            req.user = payload.user;
            return next();
        }
        const payload = isTokenValid(refreshToken);
    
        const existingToken = await Token.findOne({
            user: payload.user.userId,
            refreshToken: payload.refreshToken,
        });
    
        if (!existingToken || !existingToken?.isValid) {
            throw new CustomError.UnauthenticatedError('Authentication Invalid');
        }
    
        attachedCookiesToResponse({
            res,
            user: payload.user,
            refreshToken: existingToken.refreshToken,
        });
    
        req.user = payload.user;
        next();
    } catch (error) {
        throw new CustomError.UnauthenticatedError('Authentication Invalid');
    }
};


// authorize permission for user role - another way if we have admin and superadmin or other users
const authorizePermissions = (...roles) => {
    return (req, res, next)=> {
        if(!roles.includes(req.user.role)){
            throw new CustomError.UnauthorizedError('Unauthorized to access this route')
        }
        next()
    }

}



module.exports = {
    authenticateUser,
    authorizePermissions
}