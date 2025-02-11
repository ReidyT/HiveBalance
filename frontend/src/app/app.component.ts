import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {ContainerComponent} from './shared/components/container.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ContainerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'frontend';
}
