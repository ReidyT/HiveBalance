import {Injectable} from '@angular/core';
import {LOWER_CASE, NUMERIC, SPECIAL_CHARS, UPPER_CASE} from '../consts/password.const';

@Injectable({
  providedIn: 'root'
})
export class PasswordService {

  private readonly minLength: number = 8;

  private readonly maxLength: number = 30;

  containsAtLeastOneUpperCase(password: string) {
    return new RegExp(`[${UPPER_CASE}]+`).test(password);
  }

  containsAtLeastOneLowerCase(password: string) {
    return new RegExp(`[${LOWER_CASE}]+`).test(password);
  }

  containsAtLeastOneNumeric(password: string) {
    return new RegExp(`[${NUMERIC}]+`).test(password);
  }

  containsAtLeastOneSpecialChars(password: string) {
    return new RegExp(`[${SPECIAL_CHARS}]+`).test(password);
  }

  exceedMinLength(password: string) {
    return password.length >= this.minLength;
  }

  doNotExceedMaxLength(password: string) {
    return password.length <= this.maxLength;
  }
}
