const jwt = require('jsonwebtoken');


const createJWT = ({ payload }) => {
    const token = jwt.sign(payload, process.env.JWT_SECRET);
    return token;
};


const isTokenValid = (token) => jwt.verify(token, process.env.JWT_SECRET)



const attachedCookiesToResponse = ({res, user, refreshToken}) => {
    const accessTokenJWT = createJWT({ payload: {user} });
    const refreshTokenJWT = createJWT({ payload: {user, refreshToken} });

    const oneDay = 1000 * 60 * 60 * 24;
    const longerDays = 1000 * 60 * 60 * 24 * 30; //30 days

    res.cookie('accessToken', accessTokenJWT, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        signed: true,
        expires: new Date(Date.now() + oneDay),
    });

    res.cookie('refreshToken', refreshTokenJWT, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        signed: true,
        expires: new Date(Date.now() + longerDays),
    });
}

module.exports = {
    createJWT,
    isTokenValid,
    attachedCookiesToResponse
}