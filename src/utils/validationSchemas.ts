import Joi from 'joi';

export const teamSchema = Joi.object({
  name: Joi.string().required(),
  shortName: Joi.string().required(),
  founded: Joi.number().integer().min(1800).max(new Date().getFullYear()).required(),
  stadium: Joi.string().required(),
});

export const fixtureSchema = Joi.object({
  homeTeam: Joi.string().required(),
  awayTeam: Joi.string().required(),
  date: Joi.date().iso().required(),
  status: Joi.string().valid('pending', 'completed').required(),
  result: Joi.object({
    homeScore: Joi.number().integer().min(0),
    awayScore: Joi.number().integer().min(0),
  }).optional(),
});

export const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('user', 'admin').default('user'),
});
