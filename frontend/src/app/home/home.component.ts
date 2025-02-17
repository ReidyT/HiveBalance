import {Component, DestroyRef, inject, signal} from '@angular/core';
import {CardContainerComponent} from '../shared/components/card-container.component';
import {AuthenticationService} from '../authentication/services/authentication.service';
import {Button} from 'primeng/button';
import {StackComponent} from '../shared/components/stack.component';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';


@Component({
  selector: 'app-home',
  imports: [CardContainerComponent, Button, StackComponent],
  template: `
    <app-card-container>
      @if (authService.isLoggedIn()) {
        <app-stack [gap]="3">
          <h1>You are authenticated, some content will be added soon!</h1>
          <p-button (onClick)="logout()" [loading]="isLoading()">Log out</p-button>
        </app-stack>
      } @else {
        <h1>You are NOT authenticated, you will be redirected to the Log In page soon...</h1>
      }
    </app-card-container>
  `,
})
export class HomeComponent {
  protected isLoading = signal(false);
  protected authService = inject(AuthenticationService);

  private destroyRef = inject(DestroyRef);

  protected logout() {
    this.isLoading.set(true);
    this.authService.logout().pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: _ => this.isLoading.set(false),
      });
  }
}
