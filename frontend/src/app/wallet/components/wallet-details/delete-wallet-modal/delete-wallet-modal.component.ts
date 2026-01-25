import {Component, EventEmitter, inject, input, model, Output, signal} from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { WalletService } from '../../../services/wallet.service';
import { MessageService } from 'primeng/api';
import {WalletDeleteData} from './wallet.delete.data';

@Component({
  selector: 'app-delete-wallet-modal',
  imports: [Dialog, FormsModule, Button],
  template: `
    <p-dialog
      header="Delete Wallet Confirmation"
      [(visible)]="visible"
      [modal]="true"
      [closable]="true"
      [style]="{ width: '30vw' }"
      [breakpoints]="{ '960px': '95vw' }"
      (onHide)="close()"
    >
      <form
        #walletForm="ngForm"
        (ngSubmit)="onSubmit()"
        class="flex flex-column gap-3"
        aria-labelledby="delete-wallet-title"
      >
        <p id="delete-wallet-title">
          You're about to permanently remove
          <strong>“{{ walletData()?.name }}”</strong>.
          This action cannot be undone.
        </p>

        <!-- Actions -->
        <div class="flex justify-content-end gap-2 mt-4">
          <p-button
            type="button"
            label="Cancel"
            severity="secondary"
            (onClick)="close()"
            [disabled]="isSubmitting()"
          />

          <p-button
            type="submit"
            label="Delete wallet"
            severity="danger"
            [loading]="isSubmitting()"
            [disabled]="isSubmitting()"
            autofocus
          />
        </div>
      </form>
    </p-dialog>
  `
})
export class DeleteWalletModalComponent {
  visible = model<boolean>(false);
  walletData = input<WalletDeleteData|null>(null);

  @Output() walletDeleted = new EventEmitter<boolean>();

  private walletService = inject(WalletService);
  private messageService = inject(MessageService);

  protected isSubmitting = signal(false);

  onSubmit() {
    const wallet = this.walletData();
    if (!wallet) {
      return;
    }

    this.isSubmitting.set(true);

    this.walletService.deleteWallet(wallet.id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: `"${wallet.name}" has been deleted.` });
        this.walletDeleted.emit(true);
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
