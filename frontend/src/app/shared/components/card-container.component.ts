import {Component} from '@angular/core';

@Component({
  selector: 'app-card-container',
  imports: [],
  template: `
    <div class="card-container">
      <ng-content></ng-content>
    </div>
  `,
  styles: `
    .card-container {
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  `
})
export class CardContainerComponent {

}
