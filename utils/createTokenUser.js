
const createTokenUser = (user) => {
    return {name:user.full_name, userId:user._id, role:user.role}
}


module.exports = createTokenUser