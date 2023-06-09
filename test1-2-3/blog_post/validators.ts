import Joi from 'joi';

export const blogPostSchema = Joi.object({
  title: Joi.string().min(5).max(50).regex(/^[a-zA-Z0-9\s]+$/).required(),
  description: Joi.string().max(500).required(), 
});
