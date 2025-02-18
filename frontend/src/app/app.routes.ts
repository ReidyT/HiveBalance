import {Routes} from '@angular/router';
import {RegistrationComponent} from './authentication/components/registration.component';
import {LoginComponent} from './authentication/components/login.component';
import {HomeComponent} from './home/home.component';
import {authGuard} from './authentication/guards/auth.guard';
import {unAuthGuard} from './authentication/guards/unauth.guard';

export const routes: Routes = [
  {path: 'signUp', component: RegistrationComponent, canActivate: [unAuthGuard]},
  {path: 'login', component: LoginComponent, canActivate: [unAuthGuard]},
  {path: '', component: HomeComponent, canActivate: [authGuard]}
];
