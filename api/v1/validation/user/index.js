var Joi = require("joi");

const signUp = Joi.object({
  email: Joi.string()
    .email()
    .required(),
  password: Joi.string()
    .required()
    .min(2)
    .max(50),
  name: Joi.string().required(),
  role:Joi.string().required().allow('admin','user'),
  phone: Joi.string().required().length(10).pattern(/^[0-9]+$/),
  profession:Joi.string().required(),
  description:Joi.string().required(),
  profile_picture:Joi.string().allow(null,'')
});

const login = Joi.object({
  email: Joi.string()
    .email()
    .required(),
  password: Joi.string()
    .required()
    .min(2)
    .max(50)
});

const changePassword =  Joi.object({
  password: Joi.string()
  .required()
  .min(2)
  .max(50),
  confirm_password: Joi.string()
    .required()
    .min(2)
    .max(50)
});

const validateOtp = Joi.object({
  otp: Joi.number()
    .required(),
  email: Joi.string()
    .email().required()
});

const changeUserStatus =  Joi.object({
  email: Joi.string()
    .email()
    .required(),
  status: Joi.boolean()
    .required()
    
});

const updateUser = Joi.object({
  email: Joi.string()
    .email()
    .required(),
  name: Joi.string().required(),
  profession:Joi.string().required(),
  description:Joi.string().required(),
  profile_picture:Joi.string().allow(null,'')
});


module.exports = {
  signUp,
  login,
  validateOtp,
  changePassword ,
  changeUserStatus,
  updateUser
}

