const bcrypt = require("bcrypt");
const { logger } = require("../../../helpers/logger");
const nodeAcl = require("../../../helpers/acl-middleware/acl-permissions.js");
const { minuteDiffence, sendEmail,validateEmail } = require("../../../helpers/commonhelper");
const crypto = require('crypto');
var ResHelper = require(_pathconst.FilesPath.ResHelper);
var AuthHelper = require(_pathconst.FilesPath.AuthHelper);
var UserService = require(_pathconst.ServicesPath.UserService);
var UserValidationV1 = require(_pathconst.ReqModelsPath.UserValidationV1);



const signUp = async (req, res, next) => {
    try {
        const { error } = UserValidationV1.signUp.validate(req.body);
        if (error) {
            ResHelper.apiResponse(res, false, error.message, 401, {}, "");
        } else {
            let { email, phone, name, password,description,profession,profile_picture,role } = req.body;
            if(!validateEmail(email)){
                ResHelper.apiResponse(res, false, "This email address is Invalid or not active", 400, {}, "");
            }
            let user = await UserService.findUser(email);
            if (!user) {
                role = await UserService.findRole(role);
                let verifyOtp = Math.floor(1000 + Math.random() * 900000);
                password = await bcrypt.hash(password, 10);
                user = await UserService.signUp({ email, phone, role: role.id, name, password, description,profession,profile_picture,otp:verifyOtp,otpCreatedAt:new Date() });
                nodeAcl.nodeAcl.addUserRoles(user.id, role.id);//Users
                await sendEmail({to:email,subject:`Otp to verify you account`,body:` Please Use this Otp to verify you account ${verifyOtp} . Otp will expire in 10 minutes`});
                ResHelper.apiResponse(res, true, "Success", 201, user, "");
            } else {
                ResHelper.apiResponse(res, false, "User already exists", 204, {}, "");
            }
        }
    }
    catch (e) {
        logger.error(e)
        ResHelper.apiResponse(res, false, "Error occured during execution", 500, {}, "");
    }
}



const updateUser = async (req, res, next) => {
    try {
        const { error } = UserValidationV1.updateUser.validate(req.body);
        if (error) {
            ResHelper.apiResponse(res, false, error.message, 401, {}, "");
        } else {
            let { email,name,description,profession,profile_picture } = req.body;
            let user = await UserService.findUser(email);
            if (user) {
                user = await UserService.updateUser({ where: { email: email } }, { name,description,profession,profile_picture});
                ResHelper.apiResponse(res, true, "Success", 201, user, "");
            } else {
                ResHelper.apiResponse(res, false, "User not found", 401, {}, "");
            }
            
        }
    }
    catch (e) {
        logger.error(e)
        ResHelper.apiResponse(res, false, "Error occured during execution", 500, {}, "");
    }
}

const resendOtp = async (req, res, next) => {
    try {
        let verifyOtp = Math.floor(1000 + Math.random() * 900000);
        let user = await UserService.findUser(req.body.email);
        if (user.status != 1) {
            ResHelper.apiResponse(res, false, "This User is disabled", 401, {}, "");
        } else {
            console.log(user)
            sendEmail({
                to: user.user_email,
                subject: 'Verify OTP',
                body: `Here is your otp ${verifyOtp} for verifying the user account for user ${user.user_email}`
            });
            await UserService.updateUserOtp({ where: { email: user.user_email } }, { otp: verifyOtp, otpCreatedAt: new Date() });
            ResHelper.apiResponse(res, true, "Success", 201, {}, "");
        }
    } catch (err) {
        logger.error(err);
        ResHelper.apiResponse(res, false, "Error occured during execution", 500, {}, "");
    }
}

const validateOtp = async (req, res, next) => {
    try {
        const { error } = UserValidationV1.validateOtp.validate(req.body);
        if (error) {
            ResHelper.apiResponse(res, false, error.message, 401, {}, "");
        } else {
            let { otp,email } = req.body;
            let user = await UserService.findUser(email);
            if (user) {
                if (user.status != 1) {
                    ResHelper.apiResponse(res, false, "This User is disabled", 401, {}, "");
                } else {
                    if (minuteDiffence(new Date(user.otp_created_at), new Date()) <= 10) {
                        if (otp == user.otp) {
                            await UserService.updateUserValidateOtp({ where: {email } });
                            ResHelper.apiResponse(res, true, "Otp validated", 201, {}, "");
                        } else {
                            ResHelper.apiResponse(res, false, "Incorrect Otp", 401, {}, "");
                        }
                    } else {
                        ResHelper.apiResponse(res, false, "Otp expired", 401, {}, "");
                    }
                }
            } else {
                ResHelper.apiResponse(res, false, "User not exists", 204, {}, "");
            }
        }
    }
    catch (e) {
        logger.error(e)
        ResHelper.apiResponse(res, false, "Error occured during execution", 500, {}, "");
    }
}


const login = async (req, res, next) => {
    try {
        const { error } = UserValidationV1.login.validate(req.body);
        if (error) {
            ResHelper.apiResponse(res, false, error.message, 401, {}, "");
        } else {
            let { email, password } = req.body;
            let user = await UserService.findUser(email);
            if (user) {
                if (user.status != 1 || !user.verified ) {
                    ResHelper.apiResponse(res, false, "This User is disabled/Not Verifed.Please Contact Admin or Verfiy you account with Otp on mail", 401, {}, "");
                } else {
                    let passwordMatched = await bcrypt.compare(password, user.password);
                    if (passwordMatched) {
                        await UserService.updateTokenDate(user.user_email, new Date());
                        user = await UserService.findUser(email);
                        let token = await AuthHelper.createJWToken(user);
                        nodeAcl.nodeAcl.addUserRoles(user.id, user.role);//Users
                        ResHelper.apiResponse(res, true, "Success", 200, user, token);
                    } else {
                        ResHelper.apiResponse(res, false, "Invalid Credentials", 401, {}, "");
                    }
                }
            } else {
                ResHelper.apiResponse(res, false, "Invalid Credentials", 401, {}, "");
            }
        }
    }
    catch (e) {
        logger.error(e)
        ResHelper.apiResponse(res, false, "Error occured during execution", 500, {}, "");
    }
}




const changeUserStatus = async (req, res, next) => {
    try {
        const { error } = UserValidationV1.changeUserStatus.validate(req.body);
        if (error) {
            ResHelper.apiResponse(res, false, error.message, 401, {}, "");
        } else {
            const { email,status } = req.body;
            let user = await UserService.findUser(email);
            if (!user) {
                ResHelper.apiResponse(res, false, "User does not exist", 401, {}, "");
            } else {
                await UserService.updateUserStatus({ where: { email } }, { status: status });
                ResHelper.apiResponse(res, true, "User Status Changed", 201, {}, "");
            }
        }
    } catch (err) {
        logger.error(err);
        ResHelper.apiResponse(res.false, "Error occured during execution", 500, {}, "");
    }
}



const changePassword = async (req, res, next) => {
    try {
        const { error } = UserValidationV1.changePassword.validate(req.body);
        if (error) {
            ResHelper.apiResponse(res, false, error.message, 401, {}, "");
        } else {
            let { password, confirm_password } = req.body;
            let email = req.loggedInUser.user_email;
            if (confirm_password !== password) ResHelper.apiResponse(res, true, "Confirm Password doesnot match", 401, {}, "");
            else {
                let user = await UserService.findUser(email);
                if (user.status != true) {
                    ResHelper.apiResponse(res, false, "This User is disabled", 401, {}, "");
                } else {
                    if (user) {
                        let data = {};
                        password = await bcrypt.hash(password, 10);
                        data.password = password;
                        data.token_updated_at = new Date()
                        await UserService.updateUserPassword({ where: { email } }, data);
                        ResHelper.apiResponse(res, true, "Password Changed Successfully", 201, {}, "");
                    } else {
                        ResHelper.apiResponse(res, false, "Unauthorised", 404, {}, "");
                    }
                }
            }
        }
    }
    catch (e) {
        logger.error(e)
        ResHelper.apiResponse(res, false, "Error occured during execution", 500, {}, "");
    }
}

const getAllUsers =  async (req, res, next) => {
    try {
        const { error } = UserValidationV1.getAllUsers.validate(req.body);
        if (error) {
            ResHelper.apiResponse(res, false, error.message, 401, {}, "");
        } else {
            let { pageNumber,pageSize,search} = req.body;
            if(!pageNumber){
                pageNumber = 0;
            }
            if(!pageSize){
                pageSize =100;
            }
            let searchList  = [];
            let where  = [];
            where.push(['r.role','user']);
            if(search){
                searchList.push(['u.name','like',`%${search}%`])
                searchList.push(['u.email','like',`%${search}%`])
                searchList.push(['u.phone','like',`%${search}%`])
            }
           let users  = await  UserService.getAllUsers(where,searchList,pageNumber*pageSize,pageSize);
           ResHelper.apiResponse(res, true, "Success", 200, users, "");
        }
    }
    catch (e) {
        logger.error(e)
        ResHelper.apiResponse(res, false, "Error occured during execution", 500, {}, "");
    }
}


module.exports = {
    signUp,
    resendOtp,
    validateOtp,
    login,
    changeUserStatus,
    changePassword,
    updateUser,
    getAllUsers
};


