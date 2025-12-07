import {Routes} from '@angular/router';
import {HomeComponent} from './home/home.component';
import {authGuard} from './authentication/guards/auth.guard';
import {MainLayoutComponent} from './layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: HomeComponent
      },
      {
        path: 'wallets/:wallet-id',
        loadComponent: () => import('./wallet/components/wallet-details/wallet-details.component').then(m => m.WalletDetailsComponent)
      },
    ]
  },
  {
    path: 'auth',
    children: [
      {
        path: 'signUp',
        loadComponent: () => import('./authentication/components/registration.component').then(m => m.RegistrationComponent)
      },
      {
        path: 'login',
        loadComponent: () => import('./authentication/components/login.component').then(m => m.LoginComponent)
      }
    ]
  },
];
