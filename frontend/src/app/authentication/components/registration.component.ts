import {Component, DestroyRef, inject, signal} from '@angular/core';
import {InputTextModule} from 'primeng/inputtext';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {AuthenticationService} from '../services/authentication.service';
import {ButtonModule} from 'primeng/button';
import {matchPasswordValidator, MISMATCH_KEY, strongPasswordValidator} from '../validators/password.validator';
import {emailValidator, KEY as EMAIL_KEY} from '../validators/email.validator';
import {STRONG_PASSWORD_REGEX} from '../consts/password.const';
import {KEY as USERNAME_KEY, usernameValidator,} from '../validators/username.validator';
import {StackComponent} from '../../shared/components/stack.component';
import {FloatLabel} from 'primeng/floatlabel';
import {Password} from 'primeng/password';
import {PasswordHelperComponent} from './passwordhelper.component';
import {FluidModule} from 'primeng/fluid';
import {Card} from 'primeng/card';
import {CardContainerComponent} from '../../shared/components/card-container.component';
import {RouterLink} from '@angular/router';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-registration',
  imports: [InputTextModule, ReactiveFormsModule, ButtonModule, StackComponent, FloatLabel, Password, PasswordHelperComponent, FluidModule, Card, CardContainerComponent, RouterLink],
  template: `
    <app-card-container data-testid="registration-card">
      <p-card class="w-20rem md:w-30rem">
        <ng-template #header>
          <img alt="HiveBalance Logo" class="w-full" src="/assets/hive_balance_logo.png" />
        </ng-template>
        <ng-template #title>Create an account</ng-template>
        <ng-template #subtitle>Already have an account? <a routerLink="/login">Log in</a></ng-template>

        <form [formGroup]="registrationForm" (submit)="register()">
          <app-stack [gap]="3">
            <p-floatlabel variant="in">
              <input autocomplete="off" name="email" formControlName="email" id="email" pInputText type="text" fluid/>
              <label for="email">Email</label>
            </p-floatlabel>
            @if (formErrors.email()) {
              <small id="email-help">{{ formErrors.email() }}</small>
            }
            <p-floatlabel variant="in">
              <input autocomplete="off" name="username" formControlName="username" id="username" pInputText type="text"
                     fluid/>
              <label for="username">Username</label>
            </p-floatlabel>
            @if (formErrors.username()) {
              <small id="username-help">{{ formErrors.username() }}</small>
            }
            <form formGroupName="passwords">
              <app-stack [gap]="3" direction="column">
                <p-floatlabel variant="in" style="flex: 1">
                  <p-password [toggleMask]="true" formControlName="password" id="password" inputId="password"
                              [strongRegex]="STRONG_PASSWORD_REGEX" fluid data-testid="registration-password">
                    <ng-template #footer>
                      <app-password-helper
                        [password]="this.registrationForm.controls.passwords.controls.password.value ?? ''"/>
                    </ng-template>
                  </p-password>
                  <label for="password">Password</label>
                </p-floatlabel>
                <app-stack [gap]="3" [style]="{flex: 1}">
                  <p-floatlabel variant="in">
                    <p-password [toggleMask]="true" formControlName="confirmPassword" id="confirmPassword"
                                inputId="confirmPassword" feedback="false" fluid
                                data-testid="registration-confirm"
                                [class]="formErrors.confirmPassword() ? 'ng-dirty ng-invalid' : ''"
                    />
                    <label for="confirmPassword">Confirm Password</label>
                  </p-floatlabel>
                  @if (formErrors.confirmPassword()) {
                    <small id="confirm-password-help">{{ formErrors.confirmPassword() }}</small>
                  }
                </app-stack>
              </app-stack>
            </form>
            <p-button [disabled]="registrationForm.invalid"
                      [loading]="isLoading()"
                      type="submit"
                      class="w-full"
                      styleClass="w-full">
              Sign up
            </p-button>
          </app-stack>
        </form>
      </p-card>
    </app-card-container>
  `,
})
export class RegistrationComponent {
  protected readonly STRONG_PASSWORD_REGEX = STRONG_PASSWORD_REGEX;
  protected readonly registrationForm = new FormGroup({
    email: new FormControl('', [emailValidator()]),
    username: new FormControl('', [usernameValidator()]),
    passwords: new FormGroup({
        password: new FormControl('', [strongPasswordValidator()]),
        confirmPassword: new FormControl(''),
      }, {validators: matchPasswordValidator('password', 'confirmPassword')}
    )
  });
  protected readonly formErrors = {
    email: () => {
      const emailControl = this.registrationForm.controls.email;
      const hasErrors = emailControl.dirty && emailControl.errors;

      if (!hasErrors) {
        return false;
      }

      return emailControl.errors[EMAIL_KEY].message ?? 'An error unknown occurred.';
    },
    username: () => {
      const usernameControl = this.registrationForm.controls.username;
      const hasErrors = usernameControl.dirty && usernameControl.errors;

      if (!hasErrors) {
        return false;
      }

      return usernameControl.errors[USERNAME_KEY].message ?? 'An error unknown occurred.';
    },
    confirmPassword: () => {
      const passwordsControl = this.registrationForm.controls.passwords;
      const passwordControl = passwordsControl.controls.password;
      const hasErrors = passwordControl.dirty && passwordsControl.errors;

      if (!hasErrors) {
        return false;
      }

      return passwordsControl.errors[MISMATCH_KEY].message
    }
  };
  protected isLoading = signal(false);
  private destroyRef = inject(DestroyRef);
  private authenticationService = inject(AuthenticationService);

  protected register() {
    if (this.registrationForm.valid) {
      this.isLoading.set(true);
      this.authenticationService.registerWithRedirect({
        username: this.registrationForm.value.username!,
        email: this.registrationForm.value.email!,
        password: this.registrationForm.value.passwords!.password!,
      }).pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          error: _ => this.isLoading.set(false),
        });
    } else {
      // Should never happen.
      console.error(this.registrationForm.errors)
    }
  }
}
