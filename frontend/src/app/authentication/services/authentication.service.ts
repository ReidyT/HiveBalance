import {computed, effect, inject, Injectable, signal} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpStatusCode} from '@angular/common/http';
import {RegistrationModel} from '../models/registration.model';
import {LoginModel} from '../models/login.model';
import {BehaviorSubject, catchError, filter, finalize, map, Observable, take, tap, throwError} from 'rxjs';
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
  private refreshTokenInProgress = false
  // Subject that will hold the new access token.
  private newAccessTokenSubject = new BehaviorSubject<string | null>(null);
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
      catchError((error: HttpErrorResponse) => {
        if (error.status === HttpStatusCode.Unauthorized) {
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

  /**
   * Handles the token refresh logic, ensuring only one refresh request is active at a time.
   */
  public refreshAccessToken(): Observable<string> {
    if (this.refreshTokenInProgress) {
      // If a refresh is already in progress, wait for the new token.
      return this.newAccessTokenSubject.pipe(
        filter(token => token !== null), // Wait until the new token is available
        take(1) // Take the first value emitted
      );
    } else {
      this.refreshTokenInProgress = true;
      // Set the subject to null while the new token is being fetched
      this.newAccessTokenSubject.next(null);

      const refreshToken = this.refreshToken();

      if (!refreshToken) {
        this.refreshTokenInProgress = false;
        this.logout();
        return throwError(() => new Error('No refresh token available.'));
      }

      return this.http.post<TokensModel>(this.backendConfig.authRoutes.refreshAccessTokenUrl, null, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.refreshToken()}`
        })
      }).pipe(
        tap((tokens) => {
          // When the new token is received, save it and notify all subscribers.
          this.setTokens(tokens);
          this.newAccessTokenSubject.next(tokens.access_token);
        }),
        map(response => response.access_token),
        catchError((error) => {
          if (error.status === HttpStatusCode.Unauthorized) {
            console.error('Refresh token is invalid or expired. Logging out.', error);
            this.clearTokens();
            this.router.navigate(['/login']); // Initiate navigation
          }
          // Propagate the error to stop the request chain
          return throwError(() => error);
        }),
        finalize(() => {
          // Whether success or error, the refresh process is complete.
          this.refreshTokenInProgress = false;
        })
      );
    }
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
