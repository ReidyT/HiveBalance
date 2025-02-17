import {computed, effect, inject, Injectable, signal} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Router} from '@angular/router';
import {JwtCacheService} from '../../authentication/services/jwt.cache.service';
import {RegistrationModel} from '../../authentication/models/registration.model';
import {TokensModel} from '../../authentication/models/tokens.model';
import {catchError, map, tap, throwError} from 'rxjs';
import {LoginModel} from '../../authentication/models/login.model';

class AuthRoutes {
  public readonly authUrl;
  public readonly registrationUrl;
  public readonly loginUrl;
  public readonly logoutUrl;
  public readonly refreshAccessTokenUrl;

  constructor(private backendUrl: string) {
    this.authUrl = this.backendUrl + '/auth';
    this.registrationUrl = this.authUrl + '/register';
    this.loginUrl = this.authUrl + '/login';
    this.logoutUrl = this.authUrl + '/logout';
    this.refreshAccessTokenUrl = this.authUrl + '/refresh_token';
  }
}

@Injectable({
  providedIn: 'root',
})
export class BackendConfigService {
  public readonly apiUrl;
  public readonly authRoutes;

  constructor() {
    this.apiUrl = import.meta.env.NG_APP_BACKEND_URL;

    if (!this.apiUrl) {
      throw new Error('No API URL provided');
    }

    this.authRoutes = new AuthRoutes(this.apiUrl);
  }
}
