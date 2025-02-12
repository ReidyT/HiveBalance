import {Routes} from '@angular/router';
import {RegistrationComponent} from './authentication/components/registration.component';
import {LoginComponent} from './authentication/components/login.component';

export const routes: Routes = [
  {path: 'signUp', component: RegistrationComponent},
  {path: 'login', component: LoginComponent},
];
