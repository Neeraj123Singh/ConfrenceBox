var Joi = require("joi");

const signUpCEO = Joi.object({
  email: Joi.string()
    .email()
    .required(),
  password: Joi.string()
    .required()
    .min(2)
    .max(50),
  name: Joi.string().required(),
  phone: Joi.string().required().length(10).pattern(/^[0-9]+$/),
});

const loginCEO = Joi.object({
  email: Joi.string()
    .email()
    .required(),
  password: Joi.string()
    .required()
    .min(2)
    .max(50)
});

