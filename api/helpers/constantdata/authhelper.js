const { compare } = require('bcrypt');
var jwt = require('jwt-simple')
var moment = require('moment');
var UserService = require(_pathconst.ServicesPath.UserService);

/** 
 * @api {function} createJWToken createJWToken
 *  @apiName createJWToken
 *  @apiGroup AuthHelper
 *  @apiParam {object}  user A object of user information  .
 *  @apiDescription Create unique token with 1 minutes expire time .
 */

const compareDateString = (dt1,dt2)=>{
    dt1 = new Date(dt1);
    dt2 = new Date(dt2);
    dt1 = dt1.toUTCString() + dt1.getMilliseconds();
    dt2 = dt2.toUTCString() + dt2.getMilliseconds();
    return dt1==dt2;
}
exports.createJWToken = async function (user) {
    delete user.password;
    delete user.dummyPassword;
    var payload = {
        user: user,
        iat: moment().unix(),
        exp: Math.floor(Date.now() / 1000) + (10 * 60 * 144)//Token for a 10 minutes
    }
    return jwt.encode(payload, process.env.TOKEN_SECRET)
}

/**
 * @api {function} authorize authorize
 *  @apiName authorize
 *  @apiGroup AuthHelper
 *  @apiParam {object}  req A object of Request Call from Client  .
 *  @apiParam {object}  res A object of Response Call to Client .
 *  @apiParam {callback}  next A Callback to pass request to next midleware .
 *  @apiDescription A midleware to authorize the REST call .
 */
exports.authorize = async function (req, res, next) {
    var resModel = {
        Status: false,
        Message: "",
        Data: {}
    };
    
    if (!req.header('Authorization')) {
        resModel.Message = 'Please make sure your request has an Authorization header';
        return res.status(401).send(resModel);
    }
    var token = req.header('Authorization');
    var payload = null
    try {
        payload = jwt.decode(token, process.env.TOKEN_SECRET)
    } catch (err) {
        resModel.Message = " Invalid Status ";
        return res.status(401).send(resModel);
    }
    if (payload.exp <= moment().unix()) {
        resModel.Message = 'Token has expired';
        return res.status(401).send(resModel);
    }

    let user = await UserService.findUser(payload.user.user_email);
    if(!user || user.status!=1){
        resModel.Message = 'Invalid Token';
        return res.status(401).send(resModel);
       
    }else if(!compareDateString(user.token_updated_at,payload.user.token_updated_at)){
        resModel.Message = 'Invalid Token';
        return res.status(401).send(resModel);
    }

    req.userId = payload.userId;
    req.loggedInUser = payload.user;
    next()

}
