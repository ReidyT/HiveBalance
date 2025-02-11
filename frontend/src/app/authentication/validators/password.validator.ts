import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';
import {STRONG_PASSWORD_REGEX} from '../consts/password.const';
import {createResponse} from '../utils/validators.utils';

export const WEAK_KEY = 'weakPassword';

export function strongPasswordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const regex = new RegExp(STRONG_PASSWORD_REGEX);
    return regex.test(control.value) ? null : createResponse(WEAK_KEY, "The password is too weak.");
  }
}

export const MISMATCH_KEY = 'mismatch';

export function matchPasswordValidator(passwordField: string, confirmField: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get(passwordField)?.value;
    const confirm = control.get(confirmField)?.value;

    return password === confirm ? null : createResponse(MISMATCH_KEY, 'Please confirm your password.');
  }
}
