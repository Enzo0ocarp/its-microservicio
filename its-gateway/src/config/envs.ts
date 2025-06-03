import * as dotenv from 'dotenv';
import * as Joi from 'joi';

dotenv.config();

const schema = Joi.object({
  PORT: Joi.number().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().required(),
  MS_USER_HOST: Joi.string().required(),
  MS_USER_PORT: Joi.number().required(),
  MS_PRODUCT_HOST: Joi.string().required(),
  MS_PRODUCT_PORT: Joi.number().required(),
  MS_INVOICE_HOST: Joi.string().required(),
  MS_INVOICE_PORT: Joi.number().required(),
}).unknown(true);

const { error, value } = schema.validate(process.env);
if (error) throw new Error(`Config validation error: ${error.message}`);

export const envs = {
  port: value.PORT,
  jwt: {
    secret: value.JWT_SECRET,
    expiresIn: value.JWT_EXPIRES_IN,
  },
  microservices: {
    user: { host: value.MS_USER_HOST, port: value.MS_USER_PORT },
    product: { host: value.MS_PRODUCT_HOST, port: value.MS_PRODUCT_PORT },
    invoice: { host: value.MS_INVOICE_HOST, port: value.MS_INVOICE_PORT },
  },
};