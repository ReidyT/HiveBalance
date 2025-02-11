import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';
import {createResponse} from '../utils/validators.utils';

export const KEY = 'badEmail';

export function emailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return createResponse(KEY, "The email is required.");
    }

    if (control.value.length < 6) {
      return createResponse(KEY, "The email length must be greater or equals to 6 characters.");
    }

    if (control.value.length > 30) {
      return createResponse(KEY, "The email length must be less or equals to 30 characters.");
    }

    // regex email validation from OWASP: https://owasp.org/www-community/OWASP_Validation_Regex_Repository
    const regex = /^[a-zA-Z0-9_+&*-]+(?:\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,7}$/;
    return regex.test(control.value) ? null : createResponse(KEY, 'Invalid email address format.');
  }
}
