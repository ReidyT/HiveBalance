import {Component, computed, EventEmitter, inject, Input, Output} from '@angular/core';
import { Dialog } from 'primeng/dialog';
import {FormsModule} from '@angular/forms';
import {Button} from 'primeng/button';
import {CurrencyService} from '../../currency/services/currency.service';
import {InputText} from 'primeng/inputtext';
import {Select} from 'primeng/select';
import {WalletService} from '../services/wallet.service';
import {MessageService} from 'primeng/api';

@Component({
  selector: 'app-new-wallet-modal',
  template: `
    <p-dialog
      header="Create New Wallet"
      [(visible)]="visible"
      [modal]="true"
      [closable]="true"
      [style]="{ width: '30vw' }"
      [breakpoints]="{ '960px': '95vw' }"
      (onHide)="onClose()"
    >
      <form (ngSubmit)="onSubmit()" #walletForm="ngForm">
        <div class="p-fluid">

          <!-- Wallet Name -->
          <div class="p-field mb-3">
            <label for="walletName">Wallet Name</label>
            <input
              pInputText
              id="walletName"
              name="walletName"
              [(ngModel)]="wallet.name"
              required
              placeholder="e.g. Trip to London"
            />
          </div>

          <!-- Currency -->
          <div class="p-field mb-3">
            <label for="currency">Currency</label>
            <p-select
              id="currency"
              name="currency"
              [options]="currencies()"
              [(ngModel)]="wallet.currency"
              optionLabel="label"
              placeholder="Select currency"
              [loading]="allCurrencies.isLoading()"
              class="w-full md:w-56"
              appendTo="body"
              required
            />
          </div>

          <!-- Actions -->
          <div class="p-d-flex p-jc-end pt-2">
            <p-button type="button" label="Cancel" class="p-button-text" (click)="onClose()"></p-button>
            <p-button
              type="submit"
              label="Create"
              [disabled]="walletForm.invalid"
              data-testid="create-wallet-button"
            ></p-button>
          </div>

        </div>
      </form>
    </p-dialog>
  `,
  imports: [
    Dialog,
    FormsModule,
    Button,
    InputText,
    Select
  ],
  styles: [`
    ::ng-deep .p-dialog .p-button {
      margin-left: 0.5rem;
    }

    .p-field {
      margin-bottom: 1rem;
    }

    label {
      font-weight: 500;
      margin-bottom: 0.25rem;
      display: block;
    }

    input, p-dropdown {
      width: 100%;
    }
  `]
})
export class NewWalletModalComponent {
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() walletCreated = new EventEmitter<string|null>();

  protected currencyService = inject(CurrencyService);
  protected walletService = inject(WalletService);
  protected messageService = inject(MessageService);
  protected allCurrencies = this.currencyService.getAllCurrencies();

  protected wallet: {name: string; currency: null|{label: string, value: string}} = {
    name: '',
    currency: null
  };

  protected currencies = computed(() => {
    return this.allCurrencies.value()?.map(res => ({
        label: `${res.code} (${res.symbol})`,
        value: res.code,
      })) ?? [];
  });

  onSubmit() {
    this.walletService.createWallet({
      name: this.wallet.name,
      currencyCode: this.wallet.currency?.value ?? '',
    }).subscribe({
      next: (res) => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Wallet created successfully' });
        this.walletCreated.emit(res.id);
        this.resetForm();
        this.onClose();
      }
    });
  }

  onClose() {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  resetForm() {
    this.wallet = {
      name: '',
      currency: null
    };
  }
}

