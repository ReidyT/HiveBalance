import {Component, inject} from '@angular/core';
import {WalletService} from '../wallet/services/wallet.service';
import {DataView} from 'primeng/dataview';
import {Card} from 'primeng/card';
import {Divider} from 'primeng/divider';
import {RouterLink} from '@angular/router';
import {Button} from 'primeng/button';
import {NewWalletModalComponent} from '../wallet/components/new-wallet-modal.component';


@Component({
  selector: 'app-home',
  imports: [
    DataView,
    Card,
    Divider,
    RouterLink,
    Button,
    NewWalletModalComponent,
  ],
  template: `
    <div class="home-content-wrapper">
      @if (grantedWallets.isLoading()) {
        <div class="flex justify-content-center">
          <h3 class="text-color-secondary">Loading wallets...</h3>
        </div>
      } @else {
        <p-card header="My Wallets" styleClass="full-height-card" class="wallets-card h-full">
          <div class="scrollable-list-wrapper">
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
          </div>
        </p-card>
      }

      <p-button
        data-testid="button-new-wallet"
        icon="pi pi-plus"
        [rounded]="true"
        [raised]="true"
        (onClick)="showCreateWallet = true"
        size="large"
        class="fab-btn">
      </p-button>

      <!-- TODO: reuse one modal -->
      <app-new-wallet-modal
        [(visible)]="showCreateWallet"
        (walletCreated)="handleWalletCreated($event)">
      </app-new-wallet-modal>
    </div>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
    }

    .home-content-wrapper {
      height: 95%;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
    }

    :host ::ng-deep .full-height-card {
      display: flex;
      flex-direction: column;
      height: 100%;

      .p-card-body {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        padding-bottom: 20px;
      }

      .p-card-content {
        flex: 1;
        overflow-y: auto;
        padding-top: 0;

        scrollbar-width: thin;
        &::-webkit-scrollbar {
          width: 6px;
        }
        &::-webkit-scrollbar-thumb {
          background-color: var(--surface-400);
          border-radius: 4px;
        }
      }
    }

    :host ::ng-deep .fab-btn {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      z-index: 1000;

      /* Optional: Shadow and color tweaks */
      button {
        width: 3.5rem;
        height: 3.5rem;
        border-radius: 50%;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      }
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
  protected walletService = inject(WalletService);
  protected grantedWallets = this.walletService.getAllGrantedWallets();
  protected showCreateWallet = false;

  protected handleWalletCreated(walletId: string|null) {
    if (walletId) {
      this.grantedWallets.reload();
    }
  }
}
