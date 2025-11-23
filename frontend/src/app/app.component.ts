import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {ContainerComponent} from './shared/components/container.component';
import {Toast} from 'primeng/toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ContainerComponent, Toast],
  template: `
    <app-container>
      <p-toast/>
      <router-outlet/>
    </app-container>
  `,
  styles: `
    html, body {
      margin: 0;
      padding: 0;
      height: 100%;
      overflow: hidden; /* Prevents the window itself from scrolling */
      box-sizing: border-box;
    }

    *, *:before, *:after {
      box-sizing: inherit;
    }
  `
})
export class AppComponent {
}
