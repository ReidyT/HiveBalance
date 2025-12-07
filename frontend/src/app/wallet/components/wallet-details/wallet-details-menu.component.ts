import { Component } from '@angular/core';
import {Menu} from 'primeng/menu';
import {Badge} from 'primeng/badge';
import {Ripple} from 'primeng/ripple';
import {NgIf} from '@angular/common';
import {MenuItem} from 'primeng/api';

@Component({
  selector: 'app-wallet-details-menu',
  imports: [
    Menu,
    Badge,
    Ripple,
    NgIf
  ],
  template: `
    <p-menu [model]="items" class="flex justify-center" styleClass="w-full md:w-60">
      <ng-template #start>
        <span class="inline-flex items-center gap-1 px-2 py-2">
            🛍️
            <span class="text-xl font-semibold">
                Trip to Switzerland
            </span>
        </span>
      </ng-template>
      <ng-template #submenuheader let-item>
        <span class="text-primary font-bold">{{ item.label }}</span>
      </ng-template>
      <ng-template #item let-item>
        <a pRipple class="flex items-center p-menu-item-link">
          <span [class]="item.icon"></span>
          <span class="ml-2">{{ item.label }}</span>
          <p-badge *ngIf="item.badge" class="ml-auto" [value]="item.badge" />
          <span *ngIf="item.shortcut" class="ml-auto border border-surface rounded bg-emphasis text-muted-color text-xs p-1">
                {{ item.shortcut }}
            </span>
        </a>
      </ng-template>
    </p-menu>
  `,
  styles: ``
})
export class WalletDetailsMenuComponent {
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
            icon: 'pi pi-cog'
          },
        ]
      },
    ];
}
