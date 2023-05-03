const { logger } = require("../../../helpers/logger");
var ResHelper = require(_pathconst.FilesPath.ResHelper);
var ConfrenceService = require(_pathconst.ServicesPath.ConfrenceService);
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


module.exports = {
    createConfrence,
    editConfrence,
    getAllConfrence,
    registerConfrence,
    leaveConfrence

};


