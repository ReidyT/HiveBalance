import {Component, effect, inject, input} from '@angular/core';
import {CardContainerComponent} from '../../../shared/components/card-container.component';
import {WalletDetailsMenuComponent} from './wallet-details-menu.component';
import {StackComponent} from '../../../shared/components/stack.component';
import {WalletService} from '../../services/wallet.service';
import {LoaderComponent} from '../../../shared/components/loader.component';

@Component({
  selector: 'app-wallet-details',
  imports: [
    CardContainerComponent,
    WalletDetailsMenuComponent,
    StackComponent,
    LoaderComponent,
  ],
  template: `
    <app-loader [isLoading]="walletDetails.isLoading()">
      <app-stack direction="row" [fluid]="true" [gap]="3">
        <app-wallet-details-menu />
        <app-card-container>
          <h4>The wallet's transactions will be displayed here !</h4>
        </app-card-container>
      </app-stack>
    </app-loader>
  `,
  styles: ``
})
export class WalletDetailsComponent {
  private walletService = inject(WalletService);
  public readonly walletId = input<string | null>(null, { alias: 'wallet-id' });
  protected walletDetails = this.walletService.walletDetails;

  constructor() {
    // Sync URL -> Service
    // Whenever the route param changes, update the service signal.
    effect(() => {
      this.walletService.setActiveWallet(this.walletId());
    });
  }
}
