var UserControllerV1 = require(_pathconst.ControllersPath.UserControllerV1);
const aclPermissions = require('../../../helpers/acl-middleware/acl-helper.js');

const express = require("express");


const router = express.Router();
var AuthHelper = require(_pathconst.FilesPath.AuthHelper);

router.post("/signUp", UserControllerV1.signUp);
router.post("/login", UserControllerV1.login);
router.post("/validateOtp", UserControllerV1.validateOtp);
router.post("/resendOtp", UserControllerV1.resendOtp);
router.post("/changePassword", AuthHelper.authorize, aclPermissions.getPermissions, UserControllerV1.changePassword);
router.post("/changeUserStatus", AuthHelper.authorize, aclPermissions.getPermissions, UserControllerV1.changeUserStatus);
router.post("/updateUser", AuthHelper.authorize, aclPermissions.getPermissions, UserControllerV1.updateUser);



module.exports = router;