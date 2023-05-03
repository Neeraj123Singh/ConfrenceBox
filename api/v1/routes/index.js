const express = require("express");
const router = new express.Router();


router.use('/user', require('./user'));
router.use('/confrence', require('./confrence'));
module.exports = router;
