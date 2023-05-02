var UserControllerV1 = require(_pathconst.ControllersPath.UserControllerV1);
const aclPermissions = require('../../../helpers/acl-middleware/acl-helper.js');

const express = require("express");


const router = express.Router();
var AuthHelper = require(_pathconst.FilesPath.AuthHelper);
var UserValidationV1 = require(_pathconst.ReqModelsPath.UserValidationV1);

router.post("/signUpCEO", UserControllerV1.signUpCEO);
router.post("/loginCEO", UserControllerV1.loginCEO);
router.post("/changePassword", AuthHelper.authorize,  UserControllerV1.changePassword);
router.post("/changePasswordNew", AuthHelper.authorize,  UserControllerV1.changePasswordNew);
router.post("/resetPasswordLink", UserControllerV1.resetPasswordLink);
router.post("/resetPassword", UserControllerV1.resetPassword);
router.post("/getAllUsers", AuthHelper.authorize, aclPermissions.getPermissions, UserControllerV1.getAllUsers);
router.post("/addUser", AuthHelper.authorize, aclPermissions.getPermissions, UserControllerV1.addUser);
router.post("/validateOtp", AuthHelper.authorize, aclPermissions.getPermissions, UserControllerV1.validateOtp);//validateOtp
router.post("/resendOtp", AuthHelper.authorize, aclPermissions.getPermissions, UserControllerV1.resendOtp);
router.post("/getRoles", AuthHelper.authorize, aclPermissions.getPermissions, UserControllerV1.getRoles);
router.post("/deleteUser", AuthHelper.authorize, aclPermissions.getPermissions, UserControllerV1.deleteUser);
router.post("/updateUser", AuthHelper.authorize, aclPermissions.getPermissions, UserControllerV1.updateUser);
router.post("/getParentRole", AuthHelper.authorize, aclPermissions.getPermissions, UserControllerV1.getParentRole);
router.post("/getChildRoles", AuthHelper.authorize, aclPermissions.getPermissions, UserControllerV1.getChildRoles);
router.post("/getUserByRole", AuthHelper.authorize, aclPermissions.getPermissions, UserControllerV1.getUserByRole);
router.post("/getUserById", AuthHelper.authorize, aclPermissions.getPermissions, UserControllerV1.getUserById);
router.post("/resetPasswordLinkUrl",  UserControllerV1.resetPasswordLinkUrl);
router.post("/verifyResetPasswordLink",  UserControllerV1.verifyResetPasswordLink);
router.post("/changePasswordByAdmin", AuthHelper.authorize, aclPermissions.getPermissions, UserControllerV1.changePasswordByAdmin);
router.post("/updateStatus", AuthHelper.authorize, aclPermissions.getPermissions, UserControllerV1.updateStatus);
router.post("/getUserDsaProfile", AuthHelper.authorize, aclPermissions.getPermissions, UserControllerV1.getUserDsaProfile);
router.post("/updatePayoutStatus", AuthHelper.authorize, aclPermissions.getPermissions, UserControllerV1.updatePayoutStatus);
router.post("/updateBankStatus", AuthHelper.authorize, aclPermissions.getPermissions, UserControllerV1.updateBankStatus);


//router.post("/loginCEO", AuthHelper.authorize, aclPermissions.getPermissions, UserControllerV1.get);


module.exports = router;