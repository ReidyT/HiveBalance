import {Component, computed, inject, Signal} from '@angular/core';
import {Menu} from 'primeng/menu';
import {Badge} from 'primeng/badge';
import {Ripple} from 'primeng/ripple';

import {MenuItem, PrimeIcons} from 'primeng/api';
import {WalletService} from '../../services/wallet.service';
import {EditWalletModalComponent} from './edit-wallet-modal/edit-wallet-modal.component';
import {WalletEditData} from './edit-wallet-modal/wallet.edit.data';
import {DeleteWalletModalComponent} from './delete-wallet-modal/delete-wallet-modal.component';
import {WalletDeleteData} from './delete-wallet-modal/wallet.delete.data';
import {Router} from '@angular/router';

@Component({
  selector: 'app-wallet-details-menu',
  imports: [
    Menu,
    Badge,
    Ripple,
    EditWalletModalComponent,
    DeleteWalletModalComponent
],
  template: `
  <p-menu [model]="items" class="flex justify-center" styleClass="w-full md:w-60">
    <ng-template #start>
      <span class="inline-flex items-center gap-1 px-2 py-2">
        🛍️
        <span class="text-xl font-semibold">
          {{ walletDetails.value()?.name }}
        </span>
      </span>
    </ng-template>
    <ng-template #submenuheader let-item>
      <span class="text-primary font-bold">{{ item.label }}</span>
    </ng-template>
    <ng-template #item let-item>
      <a pRipple class="flex items-center p-menu-item-link" [attr.data-testid]="item.testId || null">
        <span [class]="item.icon"></span>
        <span class="ml-2">{{ item.label }}</span>
        @if (item.badge) {
          <p-badge class="ml-auto" [value]="item.badge"/>
        }
        @if (item.shortcut) {
          <span
            class="ml-auto border border-surface rounded bg-emphasis text-muted-color text-xs p-1">
            {{ item.shortcut }}
          </span>
        }
      </a>
    </ng-template>
  </p-menu>
  
  <app-edit-wallet-modal [(visible)]="showEditWallet" [walletData]="walletEditData()" />
  <app-delete-wallet-modal [(visible)]="showDeleteWallet" [walletData]="walletDeleteData()" (walletDeleted)="handleWalletDeleted($event)" />
  `,
  styles: ``
})
export class WalletDetailsMenuComponent {
  private walletService = inject(WalletService);
  private router = inject(Router);

  protected walletDetails = this.walletService.walletDetails;
  protected showEditWallet = false;
  protected showDeleteWallet = false;
  protected walletEditData: Signal<WalletEditData|null> = computed(() => {
    const wallet = this.walletDetails.value();

    if (!wallet) {
      return null;
    }

    return {
      id: wallet.id,
      name: wallet.name,
      currencyCode: wallet.currency.code,
    };
  });
  protected walletDeleteData: Signal<WalletDeleteData|null> = computed(() => {
    const wallet = this.walletDetails.value();

    if (!wallet) {
      return null;
    }

    return {
      id: wallet.id,
      name: wallet.name,
    };
  });
  protected items: MenuItem[] = [
      {
        separator: true
      },
      {
        label: 'Wallet',
        items: [
          {
            label: 'Search',
            icon: 'pi pi-search'
          },
          {
            label: 'Add expense',
            icon: 'pi pi-plus'
          },
          {
            label: 'Settings',
            icon: 'pi pi-cog',
            command: () => {
              this.showEditWallet = true;
            },
            testId: 'wallet-edit-settings'
          },
          {
            label: 'Delete',
            icon: PrimeIcons.TRASH,
            command: () => {
              this.showDeleteWallet = true;
            },
            testId: 'wallet-delete-btn'
          },
        ]
      },
    ];

  protected async handleWalletDeleted(deleted: boolean) {
    if (deleted) {
      await this.router.navigate(['/']);
    }
  }
}
