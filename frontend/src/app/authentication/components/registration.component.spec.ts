import {RegistrationComponent} from './registration.component';
import {AuthenticationService} from '../services/authentication.service';
import {RegistrationModel} from '../models/registration.model';
import {render, screen, fireEvent} from '@testing-library/angular';

import {TestBed} from '@angular/core/testing';
import {RegistrationPage} from '../../../test/pages/registration.page';
import {INPUT_COMMANDS} from '../../../test/utils/input.utils';


describe('RegistrationComponent', () => {

  beforeEach(async () => {
    await render(RegistrationComponent, {
      providers: [
        {provide: AuthenticationService, useValue: jasmine.createSpyObj('AuthenticationService', ['register'])}
      ],
    })
  });

  it('should call auth service with valid email, username, password and confirmPassword', async () => {
    const page = new RegistrationPage(screen);
    const mockUser: RegistrationModel = {
      email: 'test@t.ch',
      username: 'user-test',
      password: 'P@ssword123',
    }
    const authServiceSpy = TestBed.inject(AuthenticationService);

    // The registration button should be disabled.
    expect(page.registrationButton.disabled).toBeTruthy();

    // Fill the registration form with valid data.
    for (const [k, v] of Object.entries(mockUser)) {
      // Fill a new field of the form.
      await page.fillForm({[k]: v});
      // Because not all fields are filled, the button should be disabled.
      expect(page.registrationButton.disabled).toBeTruthy();
      fireEvent.click(page.registrationButton);
      expect(authServiceSpy.register).not.toHaveBeenCalled();
    }

    // Fill the missing password confirmation field.
    await page.fillForm({confirmPassword: mockUser.password});

    // The registration button should now be enabled.
    expect(page.registrationButton.disabled).toBeFalsy();

    // The authentication service should receive the correct data.
    fireEvent.click(page.registrationButton);
    expect(authServiceSpy.register).toHaveBeenCalledOnceWith(mockUser);
  });

  [
    {
      name: 'should not show errors on valid email',
      field: 'email' as const,
      inputs: [
        "user@example.com",
        "valid.email@example.com",
        "user_name@example.com",
        "user-name@example.org",
        "user+tag@example.net",
        "user123@example.co",
        "firstname.lastname@example.com",
        "user@my.example.com",
        "123test@example.com"
      ],
    },
    {
      name: 'should not show errors on valid username',
      field: 'username' as const,
      inputs: [
        "username",
        "user-name",
        "user.name",
        "user_name",
        "User123",
        "john_doe",
        "john-doe",
        "john.doe",
        "user123"
      ],
    },
    {
      name: 'should not show errors on valid password',
      field: 'password' as const,
      inputs: [
        "P@sswOrd123",
        "SimplePassword$1",
        "Str0ngP@ss",
        "S0m3th!ngUp",
        "1AmTh3R00t@"
      ],
    },
  ].forEach(({name, field, inputs}) => {
    describe(name, async () => {
      inputs.forEach((input) => {
        it(input, async () => {
          const page = new RegistrationPage(screen);

          // An empty field should be invalid.
          expect(page.fieldIsInValid(field)).toBeTruthy();
          // Fill the field with valid value.
          await page.fillForm({[field]: input});
          // The field should be valid.
          expect(page.fieldIsValid(field)).toBeTruthy();
        });
      });
    });
  });

  [
    {
      name: 'should show error on empty email address',
      field: 'email' as const,
      inputs: ['t', INPUT_COMMANDS.CLEAR],
      error: 'The email is required.',
    },
    {
      name: 'should show error on email address min length',
      field: 'email' as const,
      inputs: ['t@t.c'],
      error: 'The email length must be greater or equals to 6 characters.',
    },
    {
      name: 'should show error on email address max length',
      field: 'email' as const,
      inputs: ['thisisaverylongemail@itsolong.c'],
      error: 'The email length must be less or equals to 30 characters.',
    },
    {
      name: 'should show error on empty username address',
      field: 'username' as const,
      inputs: ['t', INPUT_COMMANDS.CLEAR],
      error: 'The username is required.',
    },
    {
      name: 'should show error on username min length',
      field: 'username' as const,
      inputs: ['tt'],
      error: 'The username length must be greater or equals to 3 characters.',
    },
    {
      name: 'should show error on username max length',
      field: 'username' as const,
      inputs: ['thisisaverylongu'],
      error: 'The username length must be less or equals to 15 characters.',
    }
  ].forEach(({name, field, inputs, error}) => {
    it(name, async () => {
      const page = new RegistrationPage(screen);
      const authServiceSpy = TestBed.inject(AuthenticationService);

      // The registration button should be disabled.
      expect(page.registrationButton.disabled).toBeTruthy();

      // Interact with the field (type or clear it).
      for (const input of inputs) {
        await page.fillForm({[field]: input});
      }
      // Because the field is not valid and the form is not complete.
      expect(page.registrationButton.disabled).toBeTruthy();
      expect(page.fieldIsInValid(field)).toBeTruthy();
      expect(screen.getByText(error).textContent).toBe(error);
      fireEvent.click(page.registrationButton);
      expect(authServiceSpy.register).not.toHaveBeenCalled();
    });
  });

  [{
    name: 'should show error on invalid email format',
    field: 'email' as const,
    inputs: [
      "invalid",
      "user@.com",
      "@example.com",
      "user@example",
      "user@@example.com",
      "user@com",
      "user@domain..com"
    ],
    error: 'Invalid email address format.'
  },
    {
      name: 'should show error on invalid username format',
      field: 'username' as const,
      inputs: [
        "user@name",
        "user name",
        "user!name",
        "user#name",
        "_username",
        "-username",
        "username-",
        "username_",
        "user__name",
        "user..name"
      ],
      error: 'Username must contain only letters, numbers, and separators (.-_), must start and end with an alphanumeric character.'
    }].forEach(({name, field, inputs, error}) => {
    describe(name, async () => {
      inputs.forEach((input) => {
        it(input, async () => {
          const page = new RegistrationPage(screen);
          const authServiceSpy = TestBed.inject(AuthenticationService);

          // The registration button should be disabled.
          expect(page.registrationButton.disabled).toBeTruthy();

          // Fill the field with invalid value.
          await page.fillForm({[field]: input});
          // Because the field is not valid and the form is not complete.
          expect(page.registrationButton.disabled).toBeTruthy();
          expect(page.fieldIsInValid(field)).toBeTruthy();
          expect(screen.getByText(error).textContent).toBe(error);

          // The authentication service should not be called.
          fireEvent.click(page.registrationButton);
          expect(authServiceSpy.register).not.toHaveBeenCalled();
        });
      });
    });
  });

  describe('should password be strong and valid', async () => {
    [
      "password", //  Missing uppercase, digit, and special character.
      "PASSWORD", // Missing lowercase, digit, and special character.
      "Pass123", //  Missing special character.
      "P@ss", // Too short (less than 8 characters).
      "P@ssword123456789012345678901234567890", // Too long (exceeds 30 characters).
    ].forEach((input) => {
      it(input, async () => {
        const page = new RegistrationPage(screen);
        const authServiceSpy = TestBed.inject(AuthenticationService);

        // The registration button should be disabled.
        expect(page.registrationButton.disabled).toBeTruthy();

        // Fill the field with invalid value.
        await page.fillForm({password: input});
        // Because the field is not valid and the form is not complete.
        expect(page.registrationButton.disabled).toBeTruthy();
        expect(page.fieldIsInValid('password')).toBeTruthy();

        // The authentication service should not be called.
        fireEvent.click(page.registrationButton);
        expect(authServiceSpy.register).not.toHaveBeenCalled();
      });
    });
  });

  it('should password be confirmed', async () => {
    const page = new RegistrationPage(screen);
    const mockUser: RegistrationModel = {
      email: 'test@t.ch',
      username: 'user-test',
      password: 'P@ssword123',
    };
    const error = 'Please confirm your password.';
    const authServiceSpy = TestBed.inject(AuthenticationService);

    // The registration button should be disabled.
    expect(page.registrationButton.disabled).toBeTruthy();

    // Fill the form.
    await page.fillForm(mockUser);
    // The registration button should still be disabled because of the missing password confirmation.
    expect(page.registrationButton.disabled).toBeTruthy();

    // Should display an error for the confirmation password, because the password is filled.
    expect(page.fieldIsInValid('confirmPassword')).toBeTruthy();
    expect(screen.getByText(error).textContent).toBe(error);
    expect(page.registrationButton.disabled).toBeTruthy();

    // Type a different password.
    await page.fillForm({confirmPassword: 'Password123'});
    expect(page.fieldIsInValid('confirmPassword')).toBeTruthy();
    expect(screen.getByText(error).textContent).toBe(error);
    expect(page.registrationButton.disabled).toBeTruthy();

    // Typing the correct password should validate the form.
    await page.clearForm("confirmPassword");
    await page.fillForm({confirmPassword: mockUser.password});
    expect(page.registrationButton.disabled).toBeFalsy();
    // The authentication service should receive the correct data.
    fireEvent.click(page.registrationButton);
    expect(authServiceSpy.register).toHaveBeenCalledOnceWith(mockUser);

    // Changing password should invalidate the confirmation password.
    await page.clearForm("password");
    await page.fillForm({password: 'Password123$'});
    expect(page.fieldIsInValid('confirmPassword')).toBeTruthy();
    expect(screen.getByText(error).textContent).toBe(error);
    expect(page.registrationButton.disabled).toBeTruthy();

    // Updating the confirmation password should validate the form again.
    await page.clearForm("confirmPassword");
    await page.fillForm({confirmPassword: 'Password123$'});
    expect(page.registrationButton.disabled).toBeFalsy();
    // The authentication service should receive the correct data.
    fireEvent.click(page.registrationButton);
    expect(authServiceSpy.register).toHaveBeenCalledWith({...mockUser, password: 'Password123$'});
  });
});
