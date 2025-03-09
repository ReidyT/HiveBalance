import {Component, DestroyRef, inject, signal} from '@angular/core';
import {CardContainerComponent} from '../shared/components/card-container.component';
import {AuthenticationService} from '../authentication/services/authentication.service';
import {Button} from 'primeng/button';
import {StackComponent} from '../shared/components/stack.component';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {WalletService} from '../wallet/services/wallet.service';
import {DataView} from 'primeng/dataview';
import {Card} from 'primeng/card';
import {Divider} from 'primeng/divider';
import {RouterLink} from '@angular/router';


@Component({
  selector: 'app-home',
  imports: [CardContainerComponent, Button, StackComponent, DataView, Card, Divider, RouterLink],
  template: `
    <app-card-container>
        <app-stack [gap]="3">
          <p-button (onClick)="logout()" [loading]="isLoading()">Log out</p-button>

          @if (grantedWallets.isLoading()) {
            <h2>Wallets are loading...</h2>
          } @else {
            <p-card>
              <p-data-view #dv [value]="grantedWallets.value()" emptyMessage="You don't have any wallets for now, don't hesitate to create one !">
                <ng-template #list let-items>
                  <div class="flex flex-column gap-2 p-1">
                    @for (wallet of grantedWallets.value(); track wallet.id) {
                      <a [routerLink]="'/wallets/' + wallet.id">
                       <div class="wallet-card flex flex-row justify-content-between align-items-baseline p-2">
                         <div class="flex flex-row align-items-baseline gap-2">
                           <div class="text-4xl font-medium">🛍️</div>
                           <div class="text-lg font-medium"><p>{{ wallet.name }}</p></div>
                         </div>
                         <i class="pi pi-angle-right" style="font-size: 1.2rem"></i>
                       </div>
                      </a>
                      <p-divider />
                    }
                  </div>
                </ng-template>
              </p-data-view>
            </p-card>
          }
        </app-stack>
    </app-card-container>
  `,
  styles: `
    .wallet-card {
      border-radius: 8px;
    }

  .wallet-card:hover {
    background: var(--p-surface-600);
    cursor: pointer;

    i, p {
      color: var(--p-surface-100);
    }
  }

  a {
    text-decoration: none;
    color: var(--p-text-color);
  }
  `,
})
export class HomeComponent {
  protected isLoading = signal(false);
  protected authService = inject(AuthenticationService);
  protected walletService = inject(WalletService);
  protected grantedWallets = this.walletService.getAllGrantedWallets();

  private destroyRef = inject(DestroyRef);

  protected logout() {
    this.isLoading.set(true);
    this.authService.logout().pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: _ => this.isLoading.set(false),
      });
  }
}
