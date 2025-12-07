import { Component } from '@angular/core';
import {CardContainerComponent} from '../../../shared/components/card-container.component';
import {WalletDetailsMenuComponent} from './wallet-details-menu.component';
import {StackComponent} from '../../../shared/components/stack.component';

@Component({
  selector: 'app-wallet-details',
  imports: [
    CardContainerComponent,
    WalletDetailsMenuComponent,
    StackComponent
  ],
  template: `
    <app-stack direction="row" [fluid]="true" [gap]="3">
      <app-wallet-details-menu />
      <app-card-container>
        <h4>The wallet's transactions will be displayed here !</h4>
      </app-card-container>
    </app-stack>
  `,
  styles: ``
})
export class WalletDetailsComponent {

}
