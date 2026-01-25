import {Component, DestroyRef, inject, signal} from '@angular/core';
import {Menubar} from 'primeng/menubar';
import {Ripple} from 'primeng/ripple';
import {Badge} from 'primeng/badge';
import {InputText} from 'primeng/inputtext';
import { NgClass, NgStyle } from '@angular/common';
import {MenuItem} from 'primeng/api';
import {BrandLogoComponent} from './brand-logo.component';
import {Button} from 'primeng/button';
import {AuthenticationService} from '../../authentication/services/authentication.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {NewWalletModalComponent} from '../../wallet/components/new-wallet-modal.component';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [
    Menubar,
    Ripple,
    Badge,
    InputText,
    NgClass,
    BrandLogoComponent,
    Button,
    NgStyle,
    NewWalletModalComponent,
    RouterLink,
    RouterLinkActive
],
  template: `
    <p-menubar [model]="items">
      <ng-template #start>
        <app-brand-logo />
      </ng-template>
      <ng-template #item let-item let-root="root">
        <!-- CASE A: It's a "Button" type item (defined in data) -->
        @if (item.data?.renderAsButton) {
          <div class="px-2">
            <p-button
              [label]="item.label"
              [icon]="item.icon"
              [severity]="item.data?.severity || 'primary'"
              [outlined]="item.data?.outlined"
              size="small">
            </p-button>
          </div>
        } @else {
          <a pRipple
            class="flex items-center p-menubar-item-link"
            [ngClass]="item.styleClass"
            [ngStyle]="item.style"
            [routerLink]="item.routerLink"
            [routerLinkActiveOptions]="item.routerLinkActiveOptions || { exact: false }"
            routerLinkActive="underline underline-offset-4 font-bold text-primar"
            >
            @if (item.icon) {
              <span [class]="item.icon" class="p-menuitem-icon mr-2 text-lg"></span>
            }
            <span>{{ item.label }}</span>
            @if (item.badge) {
              <p-badge [ngClass]="{ 'ml-auto': !root, 'ml-2': root }" [value]="item.badge" />
            }
            @if (item.shortcut) {
              <span class="ml-auto border border-surface rounded bg-emphasis text-muted-color text-xs p-1">{{ item.shortcut }}</span>
            }
            @if (item.items) {
              <i [ngClass]="['ml-auto pi', root ? 'pi-angle-down' : 'pi-angle-right']"></i>
            }
          </a>
        }
        <!-- CASE B: Standard Link Item -->
      </ng-template>
      <ng-template #end>
        <div class="flex items-center gap-2">
          <input type="text" pInputText placeholder="Search" class="w-36" />
          <p-button
            data-testid="button-logout"
            (onClick)="logout()"
            [loading]="isLoading()"
            label=""
            icon="pi pi-sign-out"
            severity="danger"
          ></p-button>
        </div>
      </ng-template>
    </p-menubar>
    
    <app-new-wallet-modal
      [(visible)]="showCreateWallet"
      (walletCreated)="handleWalletCreated($event)">
    </app-new-wallet-modal>
    `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }

    .logo-svg {
      color: var(--text-color);
      transition: fill 0.3s ease, color 0.3s ease;

      &.fixed-color {
        color: #000000 !important;
      }
    }
  `
})
export class NavbarComponent {
  protected isLoading = signal(false);
  protected authService = inject(AuthenticationService);
  private router = inject(Router);
  protected showCreateWallet = false;

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

  protected async handleWalletCreated(walletId: string | null) {
    if (walletId) {
      await this.router.navigate(['wallets', walletId]);
    }
  }

  protected items: MenuItem[] | undefined = [
    {
      label: 'Home',
      icon: 'pi pi-home',
      routerLink: '/',
      routerLinkActiveOptions: { exact: true }
    },
    {
      label: "New Wallet",
      icon: "pi pi-wallet",
      command: () => {
        this.showCreateWallet = true;
      }
    },
  ];
}
