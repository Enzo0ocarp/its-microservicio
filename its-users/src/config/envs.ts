import * as dotenv from 'dotenv';
import * as Joi from 'joi';

dotenv.config();

const schema = Joi.object({
  DB_URL: Joi.string().uri().required(),
  PORT: Joi.number().required(),
  GATEWAY_HOST: Joi.string().required(),
  GATEWAY_PORT: Joi.number().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().required(),
}).unknown(true);

const { error, value } = schema.validate(process.env);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const envs = {
  dbUrl: value.DB_URL,
  port: value.PORT,
  gateway: {
    host: value.GATEWAY_HOST,
    port: value.GATEWAY_PORT,
  },
  jwt: {
    secret: value.JWT_SECRET,
    expiresIn: value.JWT_EXPIRES_IN,
  },
};