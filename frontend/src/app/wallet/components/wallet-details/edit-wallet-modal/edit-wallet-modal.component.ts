import {Component, computed, effect, EventEmitter, inject, Input, input, model, Output, signal} from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { CurrencyService } from '../../../../currency/services/currency.service';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { WalletService } from '../../../services/wallet.service';
import { MessageService } from 'primeng/api';
import {WalletEditData} from './wallet.edit.data';

interface WalletFormState {
  name: string;
  currency: { label: string, value: string } | null;
}

@Component({
  selector: 'app-edit-wallet-modal',
  imports: [Dialog, FormsModule, Button, InputText, Select],
  template: `
    <p-dialog
      header="Edit Wallet"
      [(visible)]="visible"
      [modal]="true"
      [closable]="true"
      [style]="{ width: '30vw' }"
      [breakpoints]="{ '960px': '95vw' }"
      (onHide)="close()"
    >
      <form (ngSubmit)="onSubmit()" #walletForm="ngForm">
        <div class="flex flex-column gap-3">

          <!-- Wallet Name -->
          <div class="flex flex-column gap-2">
            <label for="walletName">Wallet Name</label>
            <input
              pInputText
              id="walletName"
              name="walletName"
              [ngModel]="formData().name"
              (ngModelChange)="updateName($event)"
              required
            />
          </div>

          <!-- Currency -->
          <div class="flex flex-column gap-2">
            <label for="currency">Currency</label>
            <p-select
              id="currency"
              name="currency"
              [options]="currencies()"
              [ngModel]="formData().currency"
              (ngModelChange)="updateCurrency($event)"
              optionLabel="label"
              placeholder="Select currency"
              [loading]="allCurrencies.isLoading()"
              class="w-full"
              appendTo="body"
              required
            />
          </div>

          <!-- Actions -->
          <div class="flex justify-content-end gap-2 mt-4">
            <p-button label="Cancel" severity="secondary" (onClick)="close()" />
            <p-button
              type="submit"
              label="Save Changes"
              [disabled]="walletForm.invalid || isSubmitting()"
              [loading]="isSubmitting()"
            />
          </div>

        </div>
      </form>
    </p-dialog>
  `
})
export class EditWalletModalComponent {
  visible = model<boolean>(false);
  walletData = input<WalletEditData | null>(null);

  @Output() walletUpdated = new EventEmitter<string>();

  private walletService = inject(WalletService);
  private messageService = inject(MessageService);
  private currencyService = inject(CurrencyService);

  protected allCurrencies = this.currencyService.getAllCurrencies();

  protected currencies = computed(() => {
    return this.allCurrencies.value()?.map(res => ({
      label: `${res.code} (${res.symbol})`,
      value: res.code,
    })) ?? [];
  });

  protected formData = signal<WalletFormState>({ name: '', currency: null });
  protected isSubmitting = signal(false);

  constructor() {
    effect(() => {
      const data = this.walletData();
      const currencyList = this.currencies();

      if (!data) return;

      const matchedCurrency = currencyList.find(c => c.value === data.currencyCode) ?? null;

      this.formData.set({
        name: data.name,
        currency: matchedCurrency
      });
    });
  }

  updateName(name: string) {
    this.formData.update(s => ({ ...s, name }));
  }

  updateCurrency(currency: any) {
    this.formData.update(s => ({ ...s, currency }));
  }

  onSubmit() {
    const original = this.walletData();
    const form = this.formData();

    if (!original || !form.name || !form.currency) return;

    this.isSubmitting.set(true);

    this.walletService.updateWallet(original.id, {
      name: form.name,
      currencyCode: form.currency.value
    }).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Wallet updated' });
        this.walletUpdated.emit(original.id);
        this.close();
      },
      error: () => this.isSubmitting.set(false),
      complete: () => this.isSubmitting.set(false)
    });
  }

  close() {
    this.visible.set(false);
  }
}
