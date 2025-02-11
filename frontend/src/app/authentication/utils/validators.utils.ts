import {ValidatorResponse} from '../models/validator.response.model';

export const createResponse = (validatorKey: string, message: string): ValidatorResponse => ({
  [validatorKey]: {
    message
  }
});
