import {Component, Input} from '@angular/core';
import {ProgressSpinner} from 'primeng/progressspinner';

@Component({
  selector: 'app-loader',
  imports: [
    ProgressSpinner
  ],
  template: `
    @if (isLoading) {
      <div class="progress-bar-container">
        <p-progress-spinner strokeWidth="8" fill="transparent" animationDuration=".5s" class="progressbar" />
      </div>
    } @else {
      <ng-content></ng-content>
    }
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
      width: 100%;
      overflow: hidden;
    }

    .progressbar {
      width: 50px;
      height: 50px;
    }

    .progress-bar-container {
      width: 100%;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  `
})
export class LoaderComponent {
  @Input() isLoading: boolean = true;

}
