import {RegistrationModel} from '../../app/authentication/models/registration.model';
import userEvent from '@testing-library/user-event';
import {applyInputCommand} from '../utils/input.utils';

type RegistrationForm = RegistrationModel & {
  confirmPassword: string;
}

export class RegistrationPage {
  public readonly emailInput: HTMLInputElement;
  public readonly usernameInput: HTMLInputElement;
  public readonly passwordInput: HTMLInputElement;
  public readonly confirmPasswordInput: HTMLInputElement;
  public readonly registrationButton: HTMLButtonElement;
  private readonly passwordInputWrapper: HTMLElement;
  private readonly confirmPasswordInputWrapper: HTMLElement;
  private readonly user = userEvent.setup();
  private readonly inputElementMapper: { [key in keyof RegistrationForm]: HTMLInputElement };

  constructor(screen: import("@testing-library/dom").Screen) {
    this.registrationButton = screen.getByRole<HTMLButtonElement>('button', {name: /sign up/i});
    this.emailInput = screen.getByRole('textbox', {name: /email/i});
    this.usernameInput = screen.getByRole('textbox', {name: /username/i});
    this.passwordInputWrapper = screen.getByTestId('registration-password');
    this.confirmPasswordInputWrapper = screen.getByTestId('registration-confirm');
    this.passwordInput = this.passwordInputWrapper.querySelector('input')!;
    this.confirmPasswordInput = this.confirmPasswordInputWrapper.querySelector('input')!;

    this.inputElementMapper = {
      email: this.emailInput,
      username: this.usernameInput,
      password: this.passwordInput,
      confirmPassword: this.confirmPasswordInput,
    };
  }

  async fillForm(registrationInput: Partial<RegistrationForm>) {
    for (const [key, value] of Object.entries(registrationInput)) {
      const input = this.inputElementMapper[key as keyof typeof this.inputElementMapper];

      if (!input) {
        throw new Error(`Input field is missing for ${key}.`);
      }

      await applyInputCommand(this.user, input, value);
    }
  }

  async clearForm(field: keyof RegistrationForm, ...fields: (keyof RegistrationForm)[]) {
    for (const key of [field, ...fields]) {
      const input = this.inputElementMapper[key];

      if (!input) {
        throw new Error(`Input field is missing for ${key}.`);
      }

      await this.user.clear(input);
    }
  }

  fieldIsValid(field: keyof RegistrationForm) {
    return this.getClassListOfInput(field).contains('ng-valid');
  }

  fieldIsInValid(field: keyof RegistrationForm) {
    return this.getClassListOfInput(field).contains('ng-invalid');
  }

  private getClassListOfInput(field: keyof RegistrationForm): DOMTokenList {
    let input: HTMLElement;

    // The class is put on the PrimeNG p-password and not on the HTML input, so we have to use the wrapper for password.
    switch (field) {
      case "password":
        input = this.passwordInputWrapper;
        break;
      case "confirmPassword":
        input = this.confirmPasswordInputWrapper;
        break;
      default:
        input = this.inputElementMapper[field];
    }

    return input.classList;
  }
}
