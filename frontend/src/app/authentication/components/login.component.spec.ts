import {LoginComponent} from './login.component';
import {fireEvent, render, screen} from '@testing-library/angular';
import {AuthenticationService} from '../services/authentication.service';
import {TestBed} from '@angular/core/testing';
import {LoginModel} from '../models/login.model';
import userEvent from '@testing-library/user-event';
import {of} from 'rxjs';

describe('LoginComponent', () => {
  const setup = () => ({
    authServiceSpy: TestBed.inject(AuthenticationService),
    loginButton: screen.getByRole<HTMLButtonElement>('button', {name: /log in/i}),
    loginInput: screen.getByRole('textbox', {name: /Username or Email/i}),
    passwordInput: screen.getByTestId('login-password').querySelector('input')!,
    user: userEvent.setup(),
  });

  beforeEach(async () => {
    const authServiceMock = jasmine.createSpyObj<AuthenticationService>(
      'AuthenticationService',
      ['loginWithRedirect']
    );

    // Configure the mock to return an Observable<boolean> with the value 'true'
    authServiceMock.loginWithRedirect.and.returnValue(of(true));

    await render(LoginComponent, {
      providers: [{
        provide: AuthenticationService,
        useValue: authServiceMock,
      }],
    })
  });

  it('should call auth service with non-empty emailOrUsername and password', async () => {
    const mockUser: LoginModel = {
      usernameOrEmail: 'test@t.ch',
      password: 'P@ssword123',
    };
    const {
      authServiceSpy,
      loginButton,
      loginInput,
      passwordInput,
      user,
    } = setup();

    // The registration button should be disabled.
    expect(loginButton.disabled).toBeTruthy();

    // Fill the email.
    await user.type(loginInput, mockUser.usernameOrEmail);
    // Because not all fields are filled, the button should be disabled.
    expect(loginButton.disabled).toBeTruthy();
    fireEvent.click(loginButton);
    expect(authServiceSpy.loginWithRedirect).not.toHaveBeenCalled();

    // Fill the password.
    await user.type(passwordInput, mockUser.password);
    // The login method should be called with the correct user login on button click.
    expect(loginButton.disabled).toBeFalsy();
    fireEvent.click(loginButton);
    expect(authServiceSpy.loginWithRedirect).toHaveBeenCalledOnceWith(mockUser);
  });
});
