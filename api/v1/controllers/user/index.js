const bcrypt = require("bcrypt");
const { logger } = require("../../../helpers/logger");
const nodeAcl = require("../../../helpers/acl-middleware/acl-permissions.js");
const { minuteDiffence, sendEmail } = require("../../../helpers/commonhelper");
const crypto = require('crypto');
var ResHelper = require(_pathconst.FilesPath.ResHelper);
var AuthHelper = require(_pathconst.FilesPath.AuthHelper);
var UserService = require(_pathconst.ServicesPath.UserService);
var UserValidationV1 = require(_pathconst.ReqModelsPath.UserValidationV1);



const signUpCEO = async (req, res, next) => {
    try {
        const { error } = UserValidationV1.signUpCEO.validate(req.body);
        if (error) {
            ResHelper.apiResponse(res, false, error.message, 401, {}, "");
        } else {
            let { email, phone, name, password } = req.body;
            let user = await UserService.findUser(email);
            if (!user) {
                let role = await UserService.findRole("CEO");
                console.log(role)
                password = await bcrypt.hash(password, 10);
                user = await UserService.signUpCEO({ email, phone, role: role.id, name, password, payout: true, bank: true });
                nodeAcl.nodeAcl.addUserRoles(user.id, "CEO");//Users
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

const getAllUsers = async (req, res, next) => {
    try {
        const { error } = UserValidationV1.getAllUsers.validate(req.body);
        if (error) {
            ResHelper.apiResponse(res, false, error.message, 401, {}, "");
        } else {
            let { startDateFilter, endDateFilter, pageNumber, pageSize, search, userName, userEmail, parent, role, status, bank, payout, phone } = req.body;
            let where = [];
            where.push(['u.isDeleted', 0]);
            let searchList = [];
            if (search) {
                searchList.push(['u.name', 'like', `%${search}%`]);
                searchList.push(['u.email', 'like', `%${search}%`]);
            }
            if (startDateFilter || endDateFilter) {
                where.push([`DATE(u.createdAt) between DATE("${startDateFilter}") and DATE("${endDateFilter}") `, null]);
            }
            if (userName) {
                where.push([`u.name like '%${userName}%' `, null]);
            }
            if (userEmail) {
                where.push([`u.email like '%${userEmail}%' `, null]);
            }
            if (parent) {
                where.push([`p.email like '%${parent}%' `, null]);
            }
            if (role) {
                where.push([`r.role like '%${role}%' `, null]);
            }
            if (status) {
                where.push([`s.name like '%${status}%' `, null]);
            }
            if (phone) {
                where.push([`u.phone like '%${phone}%' `, null]);
            }
            if (bank || bank==0) {
                where.push([`u.bank = ${bank} `, null]);
            }
            if (payout || payout==0) {
                where.push([`u.payout =  ${payout} `, null]);
            }
            let users = await UserService.getAllUsers(where, searchList, pageNumber * pageSize, pageSize);
            ResHelper.apiResponse(res, true, "Success", 200, users, "");
        }
    } catch (err) {
        console.log(err)
        logger.error(err);
        ResHelper.apiResponse(res, false, "Error occured during execution", 500, {}, "");
    }
}

const addUser = async (req, res, next) => {
    try {
        const { error } = UserValidationV1.addUser.validate(req.body);
        if (error) {
            ResHelper.apiResponse(res, false, error.message, 401, {}, "");
        } else {
            let { email, phone, role, name, password, parent } = req.body;
            parent = await UserService.findUser(parent);
            if (!parent) {
                ResHelper.apiResponse(res, false, "Parent User not found", 401, {}, "");
            } else {
                let createdByUser = await UserService.findUser(req.loggedInUser.userEmail)
                let user = await UserService.findUser(email);
                if (!user) {
                    password = await bcrypt.hash(password, 10);
                    let verifyOtp = Math.floor(1000 + Math.random() * 900000);
                    role = await UserService.findRole(role);
                    user = await UserService.addUser({ email, phone, role: role.id, name, password, parent: parent.id, createdBy: createdByUser.id, otp: verifyOtp, otpCreatedAt: new Date() });
                    sendEmail({
                        to: email,
                        subject: 'Verify OTP',
                        body: `Here is your otp ${verifyOtp} for verifying the user account for user ${email}`
                    })
                    // sendEmail({
                    //     to: req.loggedInUser.userEmail,
                    //     subject: 'Verify OTP',
                    //     body: `Here is your otp ${verifyOtp} for verifying the user account for user ${email}`
                    // })
                    ResHelper.apiResponse(res, true, "Success", 201, user, "");
                } else {
                    ResHelper.apiResponse(res, false, "User already exists", 204, {}, "");
                }
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
            let { email, phone, role, name, parent } = req.body;
            parent = await UserService.findUser(parent);
            if (!parent) {
                ResHelper.apiResponse(res, false, "Parent User not found", 401, {}, "");
            } else {
                let user = await UserService.findUser(email);
                if (user) {
                    role = await UserService.findRole(role);
                    user = await UserService.updateUser({ where: { email: email } }, { email, phone, role: role.id, name, parent: parent.id });
                    ResHelper.apiResponse(res, true, "Success", 201, user, "");
                } else {
                    ResHelper.apiResponse(res, false, "User not found", 401, {}, "");
                }
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
        let user = await UserService.findUser(req.loggedInUser.userEmail);
        if (user.isDeleted == true) {
            ResHelper.apiResponse(res, false, "This User is disabled", 401, {}, "");
        } else {
            sendEmail({
                to: user.userEmail,
                subject: 'Verify OTP',
                body: `Here is your otp ${verifyOtp} for verifying the user account for user ${user.userEmail}`
            });
            await UserService.updateUserOtp({ where: { email: user.userEmail } }, { otp: verifyOtp, otpCreatedAt: new Date() });
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
            let { otp } = req.body;
            let user = await UserService.findUser(req.loggedInUser.userEmail);
            if (user) {
                if (user.isDeleted == true) {
                    ResHelper.apiResponse(res, false, "This User is disabled", 401, {}, "");
                } else {
                    if (minuteDiffence(new Date(user.otpCreatedAt), new Date()) <= 5) {
                        if (otp == user.otp) {
                            await UserService.updateUserValidateOtp({ where: { email: req.loggedInUser.userEmail } }, { otpValidatedAt: new Date() });
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


const loginCEO = async (req, res, next) => {
    try {
        const { error } = UserValidationV1.loginCEO.validate(req.body);
        if (error) {
            ResHelper.apiResponse(res, false, error.message, 401, {}, "");
        } else {
            let { email, password } = req.body;
            let user = await UserService.findUser(email);
            if (user) {
                if (user.status != 1) {
                    ResHelper.apiResponse(res, false, "This User is disabled/blocked.Please Contact Admin", 401, {}, "");
                } else {
                    let passwordMatched = await bcrypt.compare(password, user.password);
                    if (passwordMatched) {
                        await UserService.updateTokenDate(user.userEmail, new Date());
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

const getRoles = async (req, res, next) => {
    try {
        let roles = await UserService.getRoles();
        ResHelper.apiResponse(res, true, "Success", 200, roles, "");
    } catch (err) {
        logger.error(err);
        ResHelper.apiResponse(res.false, "Error occured during execution", 500, {}, "");
    }
}


const deleteUser = async (req, res, next) => {
    try {
        const { error } = UserValidationV1.deleteUser.validate(req.body);
        if (error) {
            ResHelper.apiResponse(res, false, error.message, 401, {}, "");
        } else {
            const { email } = req.body;
            let user = await UserService.findUser(email);
            if (!user) {
                ResHelper.apiResponse(res, false, "User does not exist", 401, {}, "");
            } else {
                await UserService.updateUserDelete({ where: { email } }, { isDeleted: true });
                ResHelper.apiResponse(res, true, "User deleted", 201, {}, "");
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
            let { password, confirmPassword } = req.body;
            let email = req.loggedInUser.userEmail;
            if (confirmPassword !== password) ResHelper.apiResponse(res, true, "Confirm Password doesnot match", 401, {}, "");
            else {
                let user = await UserService.findUser(email);
                if (user.isDeleted == true) {
                    ResHelper.apiResponse(res, false, "This User is disabled", 401, {}, "");
                } else {
                    if (user) {
                        let data = {};
                        if (user.dummyPassword) data.dummyPassword = false;
                        else data.dummyPassword = true;
                        password = await bcrypt.hash(password, 10);
                        data.password = password;
                        data.tokenUpdatedAt = new Date()
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

const changePasswordNew = async (req, res, next) => {
    try {
        const { error } = UserValidationV1.changePasswordNew.validate(req.body);
        if (error) {
            ResHelper.apiResponse(res, false, error.message, 401, {}, "");
        } else {
            let { new_password } = req.body;
            let password = await bcrypt.hash(new_password, 10);
            let email = req.loggedInUser.userEmail;
            await UserService.changeUserPassword(email, password, new Date());
            ResHelper.apiResponse(res, true, "success", 401, {}, "");
        }
    }
    catch (e) {
        logger.error(e)
        ResHelper.apiResponse(res, false, "Error occured during execution", 500, {}, "");
    }
}

const getParentRole = async (req, res, next) => {
    try {
        const { error } = UserValidationV1.getParentRole.validate(req.body);
        if (error) {
            ResHelper.apiResponse(res, false, error.message, 401, {}, "");
        } else {
            const { role } = req.body
            const parentRole = findParent(rolesTree, role);
            ResHelper.apiResponse(res, true, "Parent Role Fetched Success", 200, { parentRole }, "");
        }
    } catch (err) {
        logger.error(e)
        ResHelper.apiResponse(res, false, "Error occured during execution", 500, {}, "");
    }
}

const getChildRoles = async (req, res, next) => {
    try {
        const { error } = UserValidationV1.getParentRole.validate(req.body);
        if (error) {
            ResHelper.apiResponse(res, false, error.message, 401, {}, "");
        } else {
            const { role } = req.body
            const childRoles = getAllChildNodes(rolesTree, role);
            ResHelper.apiResponse(res, true, "Child Roles Fetched Success", 200, { childRoles }, "");
        }
    } catch (err) {
        logger.error(e)
        ResHelper.apiResponse(res, false, "Error occured during execution", 500, {}, "");
    }
}
const getUserByRole = async (req, res, next) => {
    try {
        const { error } = UserValidationV1.getUserByRole.validate(req.body);
        if (error) {
            ResHelper.apiResponse(res, false, error.message, 401, {}, "");
        } else {
            let { role } = req.body;
            if (!role) role = req.loggedInUser.role;
            let where = [];
            if (role == 'CEO' || role == 'HR') {
                //codition goes here
            } else {
                where.push(['r.role', role]);
            }
            const childRoles = await UserService.getAllUsers(where, null, null, null);
            ResHelper.apiResponse(res, true, "Users Fetched Success", 200, { childRoles }, "");
        }
    } catch (err) {
        logger.error(err)
        ResHelper.apiResponse(res, false, "Error occured during execution", 500, {}, "");
    }
}

const getUserById = async (req, res, next) => {
    try {
        const { error } = UserValidationV1.getUserById.validate(req.body);
        if (error) {
            ResHelper.apiResponse(res, false, error.message, 401, {}, "");
        } else {
            const { id } = req.body;
            const user = await UserService.getUserById(id);
            ResHelper.apiResponse(res, true, "User Found", 200, user, "");
        }
    } catch (err) {
        logger.error(err)
        ResHelper.apiResponse(res, false, "Error occured during execution", 500, {}, "");
    }
}

const resetPasswordLink = async (req, res, next) => {
    try {
        const { error } = UserValidationV1.resetPasswordLink.validate(req.body);
        if (error) {
            ResHelper.apiResponse(res, false, error.message, 401, {}, "");
        } else {
            const { email } = req.body;
            const user = await UserService.findUser(email);
            if (!email) {
                ResHelper.apiResponse(res, false, " Email Not Found ", 401, user, "");
            } else {
                let otp = Math.floor(1000 + Math.random() * 900000);
                sendEmail({ to: email, subject: ` Password reset otp ${otp} `, body: ` Here is your Otp ` });
                await UserService.updateUserOtp({ where: { email } }, { otp, otpCreatedAt: new Date() });
                ResHelper.apiResponse(res, true, "Otp Send SuccessFully ", 200, user, "");
            }
        }
    } catch (err) {
        logger.error(err)
        ResHelper.apiResponse(res, false, "Error occured during execution", 500, {}, "");
    }
}



const resetPassword = async (req, res, next) => {
    try {
        const { error } = UserValidationV1.resetPassword.validate(req.body);
        if (error) {
            ResHelper.apiResponse(res, false, error.message, 401, {}, "");
        } else {
            let { otp, password, confirmPassword, email } = req.body;
            if (confirmPassword !== password) ResHelper.apiResponse(res, true, "Confirm Password doesnot match", 401, {}, "");
            else {
                let user = await UserService.findUser(email);
                if (!user) {
                    ResHelper.apiResponse(res, false, " Invalid Email ", 401, {}, "");
                } else {
                    if (user.isDeleted == true) {
                        ResHelper.apiResponse(res, false, "This User is disabled", 401, {}, "");
                    } else {
                        if (user) {
                            if (minuteDiffence(new Date(user.otpCreatedAt), new Date()) <= 5) {
                                if (otp == user.otp) {
                                    await UserService.updateUserValidateOtp({ where: { email } }, { otpValidatedAt: new Date() });
                                    let data = {};
                                    password = await bcrypt.hash(password, 10);
                                    data.password = password;
                                    data.dummyPassword = false;
                                    await UserService.updateUserPassword({ where: { email } }, data);
                                    ResHelper.apiResponse(res, true, "Password Reset Successfully", 201, {}, "");
                                } else {
                                    ResHelper.apiResponse(res, false, "Incorrect Otp", 401, {}, "");
                                }
                            } else {
                                ResHelper.apiResponse(res, false, "Otp expired", 401, {}, "");
                            }
                        } else {
                            ResHelper.apiResponse(res, false, "Unauthorised", 404, {}, "");
                        }
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

const resetPasswordLinkUrl = async (req, res, next) => {
    try {
        const { error } = UserValidationV1.resetPasswordLink.validate(req.body);
        if (error) {
            ResHelper.apiResponse(res, false, error.message, 401, {}, "");
        } else {
            let { email } = req.body;
            let user = await UserService.findUser(email);
            if (!user) {
                ResHelper.apiResponse(res, false, " Email not found ", 401, {}, "");
            } else {
                await UserService.deleteResetToken(user.id);
                let token = await crypto.randomBytes(32).toString('hex');
                let hash = await bcrypt.hash(token, 10);
                await UserService.createResetToken(user.id, hash);
                let baseUrl = process.env.BASE_URL;
                let url = `${baseUrl}?token=${token}&id=${user.id}`;
                sendEmail({
                    to: user.userEmail,
                    subject: 'Reset Password Link ',
                    body: `<html><body><h1>Here is your Password rest link for RuLoans .</h1><a href='${url}'>Reset Password</a></body></html>`
                }, true)
                ResHelper.apiResponse(res, true, "Reset Password Link Sent", 201, {}, "");
            }
        }
    }
    catch (e) {
        logger.error(e)
        ResHelper.apiResponse(res, false, "Error occured during execution", 500, {}, "");
    }
}


const verifyResetPasswordLink = async (req, res, next) => {
    try {
        const { error } = UserValidationV1.verifyResetPasswordLink.validate(req.body);
        if (error) {
            ResHelper.apiResponse(res, false, error.message, 401, {}, "");
        } else {
            let { user_id, token } = req.body;
            let reset_password_link = await UserService.getResetToken(user_id);
            console.log(reset_password_link)
            await UserService.deleteResetToken(user_id);
            if (!reset_password_link) {
                ResHelper.apiResponse(res, false, "Invalid Token", 401, {}, "");
            } else {
                if (minuteDiffence(new Date(reset_password_link.created_at), new Date()) <= 20) {//change this to 5 minutes
                    if (await bcrypt.compare(token, reset_password_link.reset_token)) {
                        let user = await UserService.getUserById(user_id);
                        await UserService.updateTokenDate(user.userEmail, new Date());
                        user = await UserService.getUserById(user_id);
                        let token = await AuthHelper.createJWToken(user);
                        ResHelper.apiResponse(res, true, "Success", 200, { token }, "");
                    } else {
                        ResHelper.apiResponse(res, false, "Inavlaid Token", 401, {}, "");
                    }
                } else {
                    ResHelper.apiResponse(res, false, "Inavlaid Token", 401, {}, "");
                }
            }
        }
    }
    catch (e) {
        logger.error(e)
        ResHelper.apiResponse(res, false, "Error occured during execution", 500, {}, "");
    }
}


const changePasswordByAdmin = async (req, res, next) => {
    try {
        const { error } = UserValidationV1.changePasswordByAdmin.validate(req.body);
        if (error) {
            ResHelper.apiResponse(res, false, error.message, 401, {}, "");
        } else {
            let { user_id, password } = req.body;
            let user = await UserService.findUserByUserId(user_id);
            if (!user) {
                ResHelper.apiResponse(res, false, "User does not exist", 401, {}, "");
            } else {
                if (user) {
                    let data = {};
                    password = await bcrypt.hash(password, 10);
                    data.password = password;
                    await UserService.changePasswordByUserId({ where: { user_id } }, data);
                    ResHelper.apiResponse(res, true, "Password Changed Successfully", 201, {}, "");
                } else {
                    ResHelper.apiResponse(res, false, "Unauthorised", 404, {}, "");
                }
            }

        }
    }
    catch (e) {
        logger.error(e)
        ResHelper.apiResponse(res, false, "Error occured during execution", 500, {}, "");
    }
}

const updateStatus = async (req, res, next) => {
    try {
        const { error } = UserValidationV1.updateStatus.validate(req.body);
        if (error) {
            ResHelper.apiResponse(res, false, error.message, 401, {}, "");
        } else {
            let { user_id, status_id } = req.body;
            let user = await UserService.findUserByUserId(user_id);
            if (!user) {
                ResHelper.apiResponse(res, false, "User does not exist", 401, {}, "");
            } else {
                await UserService.updateStatus(user_id, status_id);
                ResHelper.apiResponse(res, true, "Success", 201, {}, "");
            }
        }
    }
    catch (e) {
        logger.error(e)
        ResHelper.apiResponse(res, false, "Error occured during execution", 500, {}, "");
    }
}


const getUserDsaProfile = async (req, res, next) => {
    try {
        let user = await DSAService.getUserDsaProfileByPhone(req.loggedInUser.userPhone);
        ResHelper.apiResponse(res, true, "Success", 201, user, "");
    }
    catch (e) {
        logger.error(e)
        ResHelper.apiResponse(res, false, "Error occured during execution", 500, {}, "");
    }
}

const updatePayoutStatus = async (req, res, next) => {
    try {
        const { error } = UserValidationV1.updatePayoutStatus.validate(req.body);
        if (error) {
            ResHelper.apiResponse(res, false, error.message, 401, {}, "");
        } else {
            let { user_id, status } = req.body;
            let user = await UserService.findUserByUserId(user_id);
            if (!user) {
                ResHelper.apiResponse(res, false, "User does not exist", 401, {}, "");
            } else {
                await UserService.updatePayoutStatus(user_id, status);
                ResHelper.apiResponse(res, true, "Success", 201, {}, "");
            }
        }
    }
    catch (e) {
        logger.error(e)
        ResHelper.apiResponse(res, false, "Error occured during execution", 500, {}, "");
    }
}


const updateBankStatus = async (req, res, next) => {
    try {
        const { error } = UserValidationV1.updateBankStatus.validate(req.body);
        if (error) {
            ResHelper.apiResponse(res, false, error.message, 401, {}, "");
        } else {
            let { user_id, status } = req.body;
            let user = await UserService.findUserByUserId(user_id);
            if (!user) {
                ResHelper.apiResponse(res, false, "User does not exist", 401, {}, "");
            } else {
                await UserService.updateBankStatus(user_id, status);
                ResHelper.apiResponse(res, true, "Success", 201, {}, "");
            }
        }
    }
    catch (e) {
        logger.error(e)
        ResHelper.apiResponse(res, false, "Error occured during execution", 500, {}, "");
    }
}


module.exports = {
    signUpCEO,
    loginCEO,
    changePassword,
    changePasswordNew,
    addUser,
    validateOtp,
    getAllUsers,
    resendOtp,
    getRoles,
    deleteUser,
    updateUser,
    getParentRole,
    getChildRoles,
    getUserByRole,
    getUserById,
    resetPasswordLink,
    resetPassword,
    resetPasswordLinkUrl,
    verifyResetPasswordLink,
    changePasswordByAdmin,
    updateStatus,
    getUserDsaProfile,
    updatePayoutStatus,
    updateBankStatus
};


