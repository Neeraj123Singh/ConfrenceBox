const { logger } = require("../../../helpers/logger");
var ResHelper = require(_pathconst.FilesPath.ResHelper);
var ConfrenceService = require(_pathconst.ServicesPath.ConfrenceService);
var UserService = require(_pathconst.ServicesPath.UserService);
var ConfrenceValidationV1 = require(_pathconst.ReqModelsPath.ConfrenceValidationV1);



const createConfrence = async (req, res, next) => {
    try {
        const { error } = ConfrenceValidationV1.createConfrence.validate(req.body);
        if (error) {
            ResHelper.apiResponse(res, false, error.message, 401, {}, "");
        } else {
            let { title,agenda,date,place } = req.body;
            if(date){
                date = new Date(date)
            }
            let confrence  = await ConfrenceService.createConfrence({ title,agenda,date,place ,created_by:req.loggedInUser.id ,status:'active'});
            ResHelper.apiResponse(res, true, "Success", 201, confrence, "");
        }
    }
    catch (e) {
        logger.error(e)
        ResHelper.apiResponse(res, false, "Error occured during execution", 500, {}, "");
    }
}

const editConfrence  = async (req, res, next) => {
    try {
        const { error } = ConfrenceValidationV1.editConfrence.validate(req.body);
        if (error) {
            ResHelper.apiResponse(res, false, error.message, 401, {}, "");
        } else {
            let { id,title,agenda,date,place,status } = req.body;
            if(date){
                date = new Date(date)
            }
            let confrence  = await ConfrenceService.editConfrence({ title,agenda,date,place ,updated_at: new Date() ,status:status},id);
            ResHelper.apiResponse(res, true, "Success", 201, confrence, "");
        }
    }
    catch (e) {
        logger.error(e)
        ResHelper.apiResponse(res, false, "Error occured during execution", 500, {}, "");
    }
}

const getAllConfrence  = async (req, res, next) => {
    try {
        const { error } = ConfrenceValidationV1.getAllConfrence.validate(req.body);
        if (error) {
            ResHelper.apiResponse(res, false, error.message, 401, {}, "");
        } else {
            let { pageNumber,pageSize,search } = req.body;
            
            if(!pageSize){
                pageSize =100;
            }
            let searchList  = [];
            let where  = [];
            if(search){
                searchList.push(['c.title','like',`%${search}%`])
                searchList.push(['c.place','like',`%${search}%`])
                searchList.push(['c.agenda','like',`%${search}%`])
            }
           let confrence  = await  ConfrenceService.getAllConfrence(where,searchList,pageNumber*pageSize,pageSize);
           ResHelper.apiResponse(res, true, "Success", 200, confrence, "");
        }
    }
    catch (e) {
        logger.error(e)
        ResHelper.apiResponse(res, false, "Error occured during execution", 500, {}, "");
    }
}

const registerConfrence = async (req, res, next) => {
    try {
        const { error } = ConfrenceValidationV1.registerConfrence.validate(req.body);
        if (error) {
            ResHelper.apiResponse(res, false, error.message, 401, {}, "");
        } else {
            let { conference_id} = req.body;
            let confrence  = await ConfrenceService.getConfrenceById(conference_id);
            if(confrence){
               let userConfrence = await ConfrenceService.getUserConfrence(conference_id,req.loggedInUser.id);
               if(userConfrence){
                    ResHelper.apiResponse(res, false, "User alredy register to the Confrence", 400, {}, "");
               }else{
                    await ConfrenceService.registerConfrence(conference_id,req.loggedInUser.id);
                    ResHelper.apiResponse(res, true, "Success", 201, {}, "");
               }
            }else{
                   ResHelper.apiResponse(res, false, "Confrence Not Found or Not active ", 400, {}, "");
            }
        }
    }
    catch (e) {
        logger.error(e)
        ResHelper.apiResponse(res, false, "Error occured during execution", 500, {}, "");
    }
}

const  leaveConfrence = async (req, res, next) => {
    try {
        const { error } = ConfrenceValidationV1.registerConfrence.validate(req.body);
        if (error) {
            ResHelper.apiResponse(res, false, error.message, 401, {}, "");
        } else {
            let { conference_id} = req.body;
            let confrence  = await ConfrenceService.getConfrenceById(conference_id);
            if(confrence){
               let userConfrence = await ConfrenceService.getUserConfrence(conference_id,req.loggedInUser.id);
               if(!userConfrence){
                    ResHelper.apiResponse(res, false, "User not registered to the Confrence", 400, {}, "");
               }else{
                    await ConfrenceService.unRegisterConfrence(conference_id,req.loggedInUser.id);
                    ResHelper.apiResponse(res, true, "Success", 201, {}, "");
               }
            }else{
                   ResHelper.apiResponse(res, false, "Confrence Not Found or Not active ", 400, {}, "");
            }
        }
    }
    catch (e) {
        logger.error(e)
        ResHelper.apiResponse(res, false, "Error occured during execution", 500, {}, "");
    }
}

const getAllUsersOfConfrence = async (req, res, next) => {
    try {
        const { error } = ConfrenceValidationV1.registerConfrence.validate(req.body);
        if (error) {
            ResHelper.apiResponse(res, false, error.message, 401, {}, "");
        } else {
            let { conference_id} = req.body;
            let confrence  = await ConfrenceService.getConfrenceById(conference_id,false);
            if(!confrence){
                ResHelper.apiResponse(res, false, "Confrence Not found", 400, {}, "");
                return;
            }
            let users  = await ConfrenceService.getAllUsersOfConfrence(conference_id);
            if(users.length !=0){
                let userIds = [];
                for(let i=0;i<users.length;i++){
                    userIds.push(users[i].user_id);
                }
                users  = await UserService.getAllUsersWhereInId(userIds);
                ResHelper.apiResponse(res, true, "Success", 200,users, "");
            }else{
                ResHelper.apiResponse(res, true, "Success", 200, {}, "");
            }
        }
    }
    catch (e) {
        logger.error(e)
        ResHelper.apiResponse(res, false, "Error occured during execution", 500, {}, "");
    }
}

const updateSpeaker  = async (req, res, next) => {
    try {
        const { error } = ConfrenceValidationV1.updateSpeaker.validate(req.body);
        if (error) {
            ResHelper.apiResponse(res, false, error.message, 401, {}, "");
        } else {
            let { conference_id,speaker_id} = req.body;
            let confrence  = await ConfrenceService.getConfrenceById(conference_id);
            if(!confrence){
                ResHelper.apiResponse(res, false, "Confrence Not found or is Not Active", 400, {}, "");
                return;
            }
            let userConfrence = await ConfrenceService.getUserConfrence(conference_id,speaker_id);
            if(!userConfrence){
                 ResHelper.apiResponse(res, false, "User not registered to the Confrence", 400, {}, "");
            }else{
                 await ConfrenceService.updateSpeaker(conference_id,speaker_id);
                 ResHelper.apiResponse(res, true, "Success", 201, {}, "");
            }
        }
    }
    catch (e) {
        logger.error(e)
        ResHelper.apiResponse(res, false, "Error occured during execution", 500, {}, "");
    }
}

const voteSpeaker  = async (req, res, next) => {
    try {
        const { error } = ConfrenceValidationV1.voteSpeaker.validate(req.body);
        if (error) {
            ResHelper.apiResponse(res, false, error.message, 401, {}, "");
        } else {
            let { conference_id,speaker_id} = req.body;
            let confrence  = await ConfrenceService.getConfrenceById(conference_id);
            if(!confrence){
                ResHelper.apiResponse(res, false, "Confrence Not found or is Not Active", 400, {}, "");
                return;
            }
            let userConfrence = await ConfrenceService.getUserConfrence(conference_id,req.loggedInUser.id);
            if(!userConfrence){
                ResHelper.apiResponse(res, false, "  User is  not registered to the Confrence", 400, {}, "");
                return;
           }
            userConfrence = await ConfrenceService.getUserConfrence(conference_id,speaker_id);
            if(!userConfrence){
                 ResHelper.apiResponse(res, false, "Speaker  User is  not registered to the Confrence", 400, {}, "");
            }else{
                 await ConfrenceService.voteSpeaker(conference_id,speaker_id,req.loggedInUser.id);
                 ResHelper.apiResponse(res, true, "Success", 201, {}, "");
            }
        }
    }
    catch (e) {
        logger.error(e)
        ResHelper.apiResponse(res, false, "Error occured during execution", 500, {}, "");
    }
}

const topSpeakers  = async (req, res, next) => {
    try {
        const { error } = ConfrenceValidationV1.topSpeakers.validate(req.body);
        if (error) {
            ResHelper.apiResponse(res, false, error.message, 401, {}, "");
        } else {
            let { conference_id} = req.body;
            let confrence  = await ConfrenceService.getConfrenceById(conference_id);
            if(!confrence){
                ResHelper.apiResponse(res, false, "Confrence Not found or is Not Active", 400, {}, "");
                return;
            }
          
            let topSpeakers = await ConfrenceService.topSpeakers(conference_id);
            let users  = [];
            for(let i=0;i<topSpeakers.length;i++){
                let user = await UserService.findUserById(topSpeakers[i].speaker_id);
                let voteCout = await ConfrenceService.countVote(conference_id,topSpeakers[i].speaker_id);
                user.voteCout = voteCout;
                users.push(user);
            }
            ResHelper.apiResponse(res, true, "Success", 200, users, "");
        }
    }
    catch (e) {
        logger.error(e)
        ResHelper.apiResponse(res, false, "Error occured during execution", 500, {}, "");
    }
}


module.exports = {
    createConfrence,
    editConfrence,
    getAllConfrence,
    registerConfrence,
    leaveConfrence,
    getAllUsersOfConfrence,
    updateSpeaker,
    voteSpeaker,
    topSpeakers
};


