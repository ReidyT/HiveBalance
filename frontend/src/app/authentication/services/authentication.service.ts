import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {RegistrationModel} from '../models/registration.model';
import {LoginModel} from '../models/login.model';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {

  private readonly API_URL = 'http://localhost:8080'; // TODO: inject and read from env
  private readonly REGISTRATION_URL = '/register';
  private isLoggedIn: boolean = false;
  private httpClient = inject(HttpClient);

  public register(userRegistration: RegistrationModel) {
    console.log('AuthenticationService.register', userRegistration);
  }

  public login(userLogin: LoginModel) {
    console.log('AuthenticationService.login', userLogin);
  }
}
