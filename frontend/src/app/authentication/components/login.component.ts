import {Component, DestroyRef, inject, signal} from '@angular/core';
import {AuthenticationService} from '../services/authentication.service';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Button} from 'primeng/button';
import {Card} from 'primeng/card';
import {FloatLabel} from 'primeng/floatlabel';
import {InputText} from 'primeng/inputtext';
import {Password} from 'primeng/password';
import {StackComponent} from '../../shared/components/stack.component';
import {CardContainerComponent} from '../../shared/components/card-container.component';
import {RouterLink} from '@angular/router';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-login',
  imports: [
    Button,
    Card,
    FloatLabel,
    InputText,
    Password,
    ReactiveFormsModule,
    StackComponent,
    CardContainerComponent,
    RouterLink
  ],
  template: `
    <app-card-container data-testid="login-card">
      <p-card class="w-20rem md:w-30rem">
        <ng-template #header>
          <img alt="HiveBalance Logo" class="w-full" src="/assets/hive_balance_logo.png" />
        </ng-template>
        <ng-template #title>Welcome back !</ng-template>
        <ng-template #subtitle>Don't have an account? <a routerLink="/signUp">Sign Up</a>
        </ng-template>
        <form [formGroup]="loginForm" (submit)="login()">
          <app-stack [gap]="3">
            <p-floatlabel variant="in">
              <input autocomplete="off" name="usernameOrEmail" formControlName="usernameOrEmail"
                     id="usernameOrEmail"
                     pInputText type="text" fluid/>
              <label for="usernameOrEmail">Username or Email</label>
            </p-floatlabel>
            <p-floatlabel variant="in" style="flex: 1">
              <p-password [toggleMask]="true" [feedback]="false" formControlName="password" id="password"
                          inputId="password" fluid
                          data-testid="login-password">
              </p-password>
              <label for="password">Password</label>
            </p-floatlabel>
            <p-button [disabled]="loginForm.invalid"
                      [loading]="isLoading()"
                      type="submit"
                      class="w-full"
                      styleClass="w-full">
              Log in
            </p-button>
          </app-stack>
        </form>
      </p-card>
    </app-card-container>
  `,
})
export class LoginComponent {
  protected readonly loginForm = new FormGroup({
    usernameOrEmail: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });
  protected isLoading = signal(false);
  private authenticationService = inject(AuthenticationService);
  private destroyRef = inject(DestroyRef);

  protected login() {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.authenticationService.loginWithRedirect({
        usernameOrEmail: this.loginForm.value.usernameOrEmail!,
        password: this.loginForm.value.password!,
      }).pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          error: _ => this.isLoading.set(false),
        });
    } else {
      // Should never happen.
      console.error(this.loginForm.errors)
    }
  }
}
