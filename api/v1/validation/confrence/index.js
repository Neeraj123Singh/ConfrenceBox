var Joi = require("joi");

const  createConfrence = Joi.object({
    title: Joi.string().required(),
    agenda: Joi.string().required(),
    date:  Joi.string().required(),
    place:Joi.string().required()
});

const  editConfrence = Joi.object({
    id: Joi.string().required(),
    title: Joi.string().required(),
    agenda: Joi.string().required(),
    date:  Joi.string().required(),
    status: Joi.string().required().allow('active','inactive'),
    place:Joi.string().required()
});

const getAllConfrence  = Joi.object({
    search: Joi.string().required().allow(null,''),
    pageNumber:Joi.number().required().allow(null),
    pageSize:Joi.number().required().allow(null)
});

const registerConfrence = Joi.object({
    conference_id: Joi.string().required()
});


module.exports = {
  createConfrence,
  editConfrence,
  getAllConfrence,
  registerConfrence
}

