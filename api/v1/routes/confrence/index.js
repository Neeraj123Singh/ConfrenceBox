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
router.post("/updateSpeaker",AuthHelper.authorize, aclPermissions.getPermissions, ConfrenceControllerV1.updateSpeaker)
router.post("/voteSpeaker",AuthHelper.authorize, aclPermissions.getPermissions, ConfrenceControllerV1.voteSpeaker)
router.post("/topSpeakers",AuthHelper.authorize, aclPermissions.getPermissions, ConfrenceControllerV1.topSpeakers)
router.post("/sendCamapaign",AuthHelper.authorize, aclPermissions.getPermissions, ConfrenceControllerV1.sendCamapaign)
// run campaign for a conference


module.exports = router;