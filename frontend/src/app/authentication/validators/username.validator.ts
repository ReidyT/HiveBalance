import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';
import {createResponse} from '../utils/validators.utils';

export const KEY = 'badUsername';

export function usernameValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return createResponse(KEY, "The username is required.");
    }

    if (control.value.length < 3) {
      return createResponse(KEY, "The username length must be greater or equals to 3 characters.");
    }

    if (control.value.length > 15) {
      return createResponse(KEY, "The username length must be less or equals to 15 characters.");
    }

    const regex = /^[a-zA-Z0-9]+([._-][a-zA-Z0-9]+)*$/;
    return regex.test(control.value)
      ? null
      : createResponse(KEY, 'Username must contain only letters, numbers, and separators (.-_), must start and end with an alphanumeric character.');
  }
}
