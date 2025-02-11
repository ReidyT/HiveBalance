import {Component} from '@angular/core';

@Component({
  selector: 'app-container',
  imports: [],
  template: `
    <div class="container">
      <ng-content></ng-content>
    </div>
  `,
  styles: `
    .container {
      padding: 20px;
      height: 100%;
    }
  `
})
export class ContainerComponent {

}
