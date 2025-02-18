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
})
export class AppComponent {
}
