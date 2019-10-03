import { sanitize } from 'indicative';
import {
  messages,
  validatorInstance,
  sanitizeRules
} from './utils';

export const paramIsInterger = (req, res, next) => {
  const obj = req.params;
  const objAry = Object.values(obj);
  const notANumber = isNaN(objAry[0]);

  if (notANumber) {
    return res.status(400).json({
      error: {
        status: 400,
        code: `PAR_01`,
        message: `id is not a number`,
      },
    });
  }
  next();
};
