import {Component} from '@angular/core';

@Component({
  selector: 'app-container',
  imports: [],
  template: `
    <div class="container-wrapper">
      <ng-content></ng-content>
    </div>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
      width: 100%;
      overflow: hidden;
    }

    .container-wrapper {
      height: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem;

      display: flex;
      flex-direction: column;
    }
  `
})
export class ContainerComponent {

}
