var ConfrenceControllerV1 = require(_pathconst.ControllersPath.ConfrenceControllerV1);
const aclPermissions = require('../../../helpers/acl-middleware/acl-helper.js');

const express = require("express");


const router = express.Router();
var AuthHelper = require(_pathconst.FilesPath.AuthHelper);


router.post("/createConfrence", AuthHelper.authorize, aclPermissions.getPermissions, ConfrenceControllerV1.createConfrence);
router.post("/getAllConfrence", AuthHelper.authorize, aclPermissions.getPermissions, ConfrenceControllerV1.getAllConfrence);
router.post("/editConfrence", AuthHelper.authorize, aclPermissions.getPermissions, ConfrenceControllerV1.editConfrence);
router.post("/registerConfrence", AuthHelper.authorize, aclPermissions.getPermissions, ConfrenceControllerV1.registerConfrence);
router.post("/unRegisterConfrence", AuthHelper.authorize, aclPermissions.getPermissions, ConfrenceControllerV1.leaveConfrence);
router.post("/getAllUsersOfConfrence",AuthHelper.authorize, aclPermissions.getPermissions, ConfrenceControllerV1.getAllUsersOfConfrence)
// update sepeaker 
// vote speaker for confrence
// get top speakers of confrence
// run campaign for a conference


module.exports = router;