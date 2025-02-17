import {Component, inject} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {ContainerComponent} from './shared/components/container.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ContainerComponent],
  template: `
    <app-container>
      <router-outlet/>
    </app-container>
  `,
})
export class AppComponent {
}
