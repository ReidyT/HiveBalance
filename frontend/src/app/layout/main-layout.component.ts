import { Component } from '@angular/core';
import {NavbarComponent} from '../shared/components/navbar.component';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-main-layout',
  imports: [
    NavbarComponent,
    RouterOutlet
  ],
  template: `
    <app-navbar class="layout-navbar"></app-navbar>
    <main class="layout-content">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      height: 100dvh; /* Dynamic viewport height */
      width: 100%;
      gap: 30px;
    }

    .layout-navbar {
      flex: 0 0 auto; /* Fixed height */
      z-index: 100;
    }

    .layout-content {
      flex: 1; /* Fills remaining space */
      overflow: hidden; /* <--- KEY: No scrollbar on this outer wrapper */
      position: relative;
      display: flex; /* Helps children fill height */
      flex-direction: column;
    }
  `
})
export class MainLayoutComponent {

}
