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
  imports: [
    CardContainerComponent,
    Button,
    StackComponent,
    DataView,
    Card,
    Divider,
    RouterLink,
  ],
  template: `
    <app-card-container>
      <div class="home-content-wrapper">
        <app-stack [gap]="3">
          <div class="flex justify-content-end">
            <p-button
              (onClick)="logout()"
              [loading]="isLoading()"
              label="Log out"
              icon="pi pi-sign-out"
            ></p-button>
          </div>

          @if (grantedWallets.isLoading()) {
            <div class="flex justify-content-center">
              <h3 class="text-color-secondary">Loading wallets...</h3>
            </div>
          } @else {
            <p-card header="My Wallets" class="wallets-card">
              <p-data-view
                [value]="grantedWallets.value()"
                layout="list"
                emptyMessage="🚫 You don't have any wallets yet. Why not create one?"
              >
                <ng-template #list let-wallets>
                  <div class="wallet-list">
                    @for (wallet of grantedWallets.value(); let last = $last; track wallet.id) {
                      <a [routerLink]="'/wallets/' + wallet.id" class="wallet-link">
                        <div class="wallet-card p-4">
                          <div class="wallet-card-content">
                            <div class="flex align-items-center gap-3">
                              <div class="emoji">🛍️</div>
                              <div class="wallet-name">{{ wallet.name }}</div>
                            </div>
                            <i class="pi pi-angle-right text-secondary"></i>
                          </div>
                        </div>
                      </a>

                      @if (!last) {
                        <p-divider />
                      }
                    }
                  </div>
                </ng-template>
              </p-data-view>
            </p-card>
          }
        </app-stack>
      </div>
    </app-card-container>
  `,
  styles: `
    .home-content-wrapper {
      max-width: 640px;
      margin: 0 auto;
      width: 100%;
    }

    .wallet-card {
      background-color: var(--p-surface-card, #1e1e1e); /* Dark card for dark theme */
      border-radius: 12px;
      transition: background 0.3s, transform 0.2s;
      min-height: 100px;
      display: flex;
      align-items: center;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
      padding: 1.25rem;
    }

    .wallet-card:hover {
      background-color: var(--p-surface-600, #2c2c2c);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    }

    .wallet-card-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .wallet-name {
      font-size: 1.3rem;
      font-weight: 600;
      color: var(--p-text-color, #ffffff);
    }

    .emoji {
      font-size: 1.8rem;
    }

    .wallets-card {
      border: none;
      box-shadow: none;
      background-color: transparent;
    }

    .wallet-list {
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    .wallet-link {
      text-decoration: none;
      color: inherit;
      display: block;
    }

    @media screen and (max-width: 600px) {
      .home-content-wrapper {
        padding: 0 1rem;
      }

      .wallet-name {
        font-size: 1.1rem;
      }

      .emoji {
        font-size: 1.5rem;
      }

      .wallet-card {
        min-height: 80px;
        padding: 1rem;
      }
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
    this.authService
      .logout()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: _ => this.isLoading.set(false),
      });
  }
}
