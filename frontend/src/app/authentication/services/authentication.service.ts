import {computed, effect, inject, Injectable, signal} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {RegistrationModel} from '../models/registration.model';
import {LoginModel} from '../models/login.model';
import {catchError, map, tap, throwError} from 'rxjs';
import {TokensModel} from '../models/tokens.model';
import {Router} from '@angular/router';
import {JwtCacheService} from './jwt.cache.service';
import {BackendConfigService} from '../../shared/services/backend.config.service';


@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private accessToken = signal<string | null>(null);
  public isLoggedIn = computed(() => !!this.accessToken());
  private refreshToken = signal<string | null>(null);
  private http = inject(HttpClient);
  private router = inject(Router);
  private jwtCache = inject(JwtCacheService);
  private backendConfig = inject(BackendConfigService);

  constructor() {
    this.accessToken.set(this.jwtCache.getAccessToken());
    this.refreshToken.set(this.jwtCache.getRefreshToken());

    // Automatically update jwt cache service when signals change
    effect(() => this.jwtCache.synchronizeAccessToken(this.accessToken()));
    effect(() => this.jwtCache.synchronizeRefreshToken(this.refreshToken()));
  }

  public getAccessToken() {
    return this.accessToken();
  }

  public registerWithRedirect(userRegistration: RegistrationModel, redirectTo: string = '/') {
    return this.http.post<TokensModel>(this.backendConfig.authRoutes.registrationUrl, userRegistration).pipe(
      tap(tokens => this.setTokens(tokens)),
      tap(() => this.router.navigate([redirectTo])), // Navigate on success
      map(() => true), // Signal success
      catchError(error => {
        console.error('Registration failed:', error);
        //Revert any token state changes.
        this.clearTokens();
        return throwError(() => error); // Propagate the error
      })
    );
  }

  public loginWithRedirect({usernameOrEmail, password}: LoginModel, redirectTo: string = '/') {
    return this.http.post<TokensModel>(this.backendConfig.authRoutes.loginUrl, null, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${usernameOrEmail}:${password}`)
      })
    }).pipe(
      tap(tokens => this.setTokens(tokens)),
      tap(() => this.router.navigate([redirectTo])), // Navigate on success
      map(() => true), // Signal success
      catchError(error => {
        if (error.status === 401) {
          console.error('Login failed:', error);
          //Revert any token state changes.
          this.clearTokens();
        }
        return throwError(() => error); // Propagate the error
      })
    );
  }

  public logout() {
    if (!this.isLoggedIn()) {
      throw new Error('Not logged in! You cannot log out.');
    }

    return this.http.post<void>(this.backendConfig.authRoutes.logoutUrl, null).pipe(
      tap(() => this.clearTokens()),
      tap(() => this.router.navigate(['/login'])), // Navigate on success
      map(() => true), // Signal success
      catchError(error => {
        console.error('Logout failed:', error);
        return throwError(() => error); // Propagate the error
      })
    );
  }

  public refreshAccessToken() {
    // Call the refresh token endpoint to get a new access token
    return this.http.post<TokensModel>(this.backendConfig.authRoutes.refreshAccessTokenUrl, null).pipe(
      tap((tokens) => this.setTokens(tokens)),
      map((tokens) => tokens.access_token),
      catchError(async (error) => {
        if (error.status === 401) {
          // Handle refresh token error (e.g., redirect to login page)
          console.error('Error refreshing access token:', error);
          this.clearTokens();
          await this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }

  private setTokens({access_token, refresh_token}: TokensModel) {
    this.accessToken.set(access_token);
    this.refreshToken.set(refresh_token);
  }

  private clearTokens() {
    this.accessToken.set(null);
    this.refreshToken.set(null);
  }
}
