import { validations } from 'indicative';
import Validator from 'indicative/builds/validator';
import { Vanilla } from 'indicative/builds/formatters';

const message = {
  required: 'Input your {{ field }}',
  email: 'The value provided is not an email',
  integer: '{{ field }} must be an integer',
};

const sanitizeRules = {};

const validatorInstance = Validator(validations, Vanilla);

export { message, sanitizeRules, validatorInstance };
