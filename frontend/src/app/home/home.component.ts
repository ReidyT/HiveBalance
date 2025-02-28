import {Component, DestroyRef, inject, OnInit, Signal, signal} from '@angular/core';
import {CardContainerComponent} from '../shared/components/card-container.component';
import {AuthenticationService} from '../authentication/services/authentication.service';
import {Button} from 'primeng/button';
import {StackComponent} from '../shared/components/stack.component';
import {takeUntilDestroyed, toSignal} from '@angular/core/rxjs-interop';
import {WalletService} from '../wallet/services/wallet.service';
import {AsyncPipe} from '@angular/common';
import {Observable} from 'rxjs';
import {GrantedWalletResponseModel} from '../wallet/models/granted.wallet.response.model';


@Component({
  selector: 'app-home',
  imports: [CardContainerComponent, Button, StackComponent, AsyncPipe],
  template: `
    <app-card-container>
      @if (authService.isLoggedIn()) {
        <app-stack [gap]="3">
          <h1>You are authenticated, some content will be added soon!</h1>
          <p-button (onClick)="logout()" [loading]="isLoading()">Log out</p-button>

          <ul>
          @for (wallet of grantedWallets(); track wallet.id) {
            <li>{{wallet.name}}</li>
          } @empty {
            <li>You have no wallets for now, don't hesitate to create one !</li>
          }
          </ul>
        </app-stack>
      } @else {
        <h1>You are NOT authenticated, you will be redirected to the Log In page soon...</h1>
      }
    </app-card-container>
  `,
})
export class HomeComponent implements OnInit{
  protected isLoading = signal(false);
  protected authService = inject(AuthenticationService);
  protected walletService = inject(WalletService);

  // TODO: check rxResource or resource? At least it should be immutable !
  protected grantedWallets = this.walletService.grantedWallets;

  ngOnInit(): void {
   this.walletService.getAllGrantedWallets().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  private destroyRef = inject(DestroyRef);

  protected logout() {
    this.isLoading.set(true);
    this.authService.logout().pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: _ => this.isLoading.set(false),
      });
  }
}
