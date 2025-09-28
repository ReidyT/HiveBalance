import {TestBed} from '@angular/core/testing';
import {AuthenticationService} from './authentication.service';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {Router} from '@angular/router';
import {HttpErrorResponse, HttpStatusCode, provideHttpClient} from '@angular/common/http';
import {TokensModel} from '../models/tokens.model';
import {RegistrationModel} from '../models/registration.model';
import {JwtCacheService} from './jwt.cache.service';
import {BackendConfigService} from '../../shared/services/backend.config.service';
import {of} from 'rxjs';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;
  let jwtCacheSpy: jasmine.SpyObj<JwtCacheService>;
  let backendConfigSpy: jasmine.SpyObj<BackendConfigService>;

  // Define some mock token values for easier testing
  const MOCK_INITIAL_ACCESS_TOKEN = 'initialAccessToken123';
  const MOCK_INITIAL_REFRESH_TOKEN = 'initialRefreshToken456';

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);
    jwtCacheSpy = jasmine.createSpyObj<JwtCacheService>('JwtCacheService', ['getAccessToken', 'getRefreshToken', 'synchronizeAccessToken', 'synchronizeRefreshToken']);
    backendConfigSpy = jasmine.createSpyObj<BackendConfigService>('BackendConfigService', [], {
      apiUrl: 'http://localhost',
      authRoutes: {
        authUrl: 'http://localhost/auth',
        registrationUrl: 'http://localhost/auth/register',
        loginUrl: 'http://localhost/auth/login',
        logoutUrl: 'http://localhost/auth/logout',
        refreshAccessTokenUrl: 'http://localhost/auth/refresh'
      }
    });

    // Mock the jwtCacheSpy to return tokens when the service is initialized
    jwtCacheSpy.getAccessToken.and.returnValue(MOCK_INITIAL_ACCESS_TOKEN);
    jwtCacheSpy.getRefreshToken.and.returnValue(MOCK_INITIAL_REFRESH_TOKEN);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthenticationService,
        {provide: Router, useValue: routerSpy},
        {provide: JwtCacheService, useValue: jwtCacheSpy},
        {provide: BackendConfigService, useValue: backendConfigSpy}
      ]
    });

    service = TestBed.inject(AuthenticationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    // Verify that the service initializes with cached tokens
    expect(service.getAccessToken()).toBe(MOCK_INITIAL_ACCESS_TOKEN);
    expect(service.isLoggedIn()).toBeTrue();
  });

  describe('registerWithRedirect', () => {
    it('should register user and navigate to redirect URL', () => {
      const mockTokens: TokensModel = {access_token: 'mockAccessToken', refresh_token: 'mockRefreshToken'};
      const userRegistration: RegistrationModel = {email: 'test@example.com', username: 'testUser', password: 'testPass'};
      const redirectTo = '/';

      service.registerWithRedirect(userRegistration, redirectTo).subscribe(success => {
        expect(success).toBeTrue();
        expect(service.getAccessToken()).toBe(mockTokens.access_token);
        expect(jwtCacheSpy.synchronizeAccessToken).toHaveBeenCalledWith(mockTokens.access_token);
        expect(jwtCacheSpy.synchronizeRefreshToken).toHaveBeenCalledWith(mockTokens.refresh_token);
      });

      const req = httpMock.expectOne(backendConfigSpy.authRoutes.registrationUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(userRegistration);
      req.flush(mockTokens);

      expect(routerSpy.navigate).toHaveBeenCalledWith([redirectTo]);
    });

    it('should handle registration error and clear tokens', () => {
      // For this test, ensure the service *starts* with tokens to verify they are cleared on error.
      // The `beforeEach` already sets them, so this is implicitly covered.
      const errorResponse = new HttpErrorResponse({status: 400, statusText: 'Bad Request'});
      const userRegistration: RegistrationModel = {email: 'fail@example.com', username: 'failUser', password: 'failPass'};

      service.registerWithRedirect(userRegistration).subscribe({
        error: error => {
          expect(error.status).toBe(400);
          expect(service.getAccessToken()).toBeNull(); // Tokens should be cleared
          expect(service.isLoggedIn()).toBeFalse();
          expect(jwtCacheSpy.synchronizeAccessToken).toHaveBeenCalledWith(null);
          expect(jwtCacheSpy.synchronizeRefreshToken).toHaveBeenCalledWith(null);
        }
      });

      const req = httpMock.expectOne(backendConfigSpy.authRoutes.registrationUrl);
      expect(req.request.method).toBe('POST');
      req.flush({message: 'Error'}, errorResponse);

      expect(routerSpy.navigate).not.toHaveBeenCalled(); // Should not navigate on error
    });
  });

  describe('loginWithRedirect', () => {
    it('should log in user and navigate to redirect URL', () => {
      const mockTokens: TokensModel = {access_token: 'loggedInAccessToken', refresh_token: 'loggedInRefreshToken'};
      const credentials = {usernameOrEmail: 'testUser', password: 'testPass'};
      const redirectTo = '/dashboard';

      service.loginWithRedirect(credentials, redirectTo).subscribe(success => {
        expect(success).toBeTrue();
        expect(service.getAccessToken()).toBe(mockTokens.access_token);
        expect(jwtCacheSpy.synchronizeAccessToken).toHaveBeenCalledWith(mockTokens.access_token);
        expect(jwtCacheSpy.synchronizeRefreshToken).toHaveBeenCalledWith(mockTokens.refresh_token);
      });

      const req = httpMock.expectOne(backendConfigSpy.authRoutes.loginUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      expect(req.request.headers.get('Authorization')).toBe('Basic ' + btoa(`${credentials.usernameOrEmail}:${credentials.password}`));
      req.flush(mockTokens);

      expect(routerSpy.navigate).toHaveBeenCalledWith([redirectTo]);
    });

    it('should handle login failure due to unauthorized error and clear tokens', () => {
      const errorResponse = new HttpErrorResponse({status: HttpStatusCode.Unauthorized, statusText: 'Unauthorized'});
      const credentials = {usernameOrEmail: 'test', password: 'wrongPass'};

      service.loginWithRedirect(credentials).subscribe({
        error: error => {
          expect(error.status).toBe(HttpStatusCode.Unauthorized);
          expect(service.getAccessToken()).toBeNull(); // Tokens should be cleared
          expect(service.isLoggedIn()).toBeFalse();
          expect(jwtCacheSpy.synchronizeAccessToken).toHaveBeenCalledWith(null);
          expect(jwtCacheSpy.synchronizeRefreshToken).toHaveBeenCalledWith(null);
        }
      });

      const req = httpMock.expectOne(backendConfigSpy.authRoutes.loginUrl);
      expect(req.request.method).toBe('POST');
      req.flush({message: 'Unauthorized'}, errorResponse);

      expect(routerSpy.navigate).not.toHaveBeenCalled(); // Should not navigate on error
    });

    it('should handle other login errors without clearing tokens (only Unauthorized clears)', () => {
      const errorResponse = new HttpErrorResponse({status: HttpStatusCode.InternalServerError, statusText: 'Server Error'});
      const credentials = {usernameOrEmail: 'test', password: 'wrongPass'};

      service.loginWithRedirect(credentials).subscribe({
        error: error => {
          expect(error.status).toBe(HttpStatusCode.InternalServerError);
          // Tokens should *not* be cleared for non-unauthorized errors
          expect(service.getAccessToken()).toBe(MOCK_INITIAL_ACCESS_TOKEN);
          expect(service.isLoggedIn()).toBeTrue();
          expect(jwtCacheSpy.synchronizeAccessToken).not.toHaveBeenCalledWith(null);
          expect(jwtCacheSpy.synchronizeRefreshToken).not.toHaveBeenCalledWith(null);
        }
      });

      const req = httpMock.expectOne(backendConfigSpy.authRoutes.loginUrl);
      expect(req.request.method).toBe('POST');
      req.flush({message: 'Internal Server Error'}, errorResponse);
    });
  });

  describe('logout', () => {
    it('should log out user and navigate to /login when logged in', () => {
      // The beforeEach sets up the service as logged in.
      expect(service.isLoggedIn()).toBeTrue(); // Sanity check

      service.logout().subscribe(success => {
        expect(success).toBeTrue();
        expect(service.getAccessToken()).toBeNull();
        expect(service.isLoggedIn()).toBeFalse();
        expect(jwtCacheSpy.synchronizeAccessToken).toHaveBeenCalledWith(null);
        expect(jwtCacheSpy.synchronizeRefreshToken).toHaveBeenCalledWith(null);
      });

      const req = httpMock.expectOne(backendConfigSpy.authRoutes.logoutUrl);
      expect(req.request.method).toBe('POST');
      req.flush(null);

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should throw an error if user is not logged in', () => {
      // Clear tokens for this specific test case to simulate not logged in
      (service as any).accessToken.set(null);
      (service as any).refreshToken.set(null);
      expect(service.isLoggedIn()).toBeFalse();

      expect(() => service.logout()).toThrowError('Not logged in! You cannot log out.');
      expect(httpMock.expectNone(backendConfigSpy.authRoutes.logoutUrl)); // No HTTP call
      expect(routerSpy.navigate).not.toHaveBeenCalled(); // No navigation
    });

    it('should handle logout error but still clear tokens and navigate', () => {
      const errorResponse = new HttpErrorResponse({status: HttpStatusCode.InternalServerError, statusText: 'Logout Failed'});

      service.logout().subscribe({
        next: success => expect(success).toBeTrue(), // Logout still resolves to true despite backend error
        error: err => fail('Expected logout to complete even with an error, not error out')
      });

      const req = httpMock.expectOne(backendConfigSpy.authRoutes.logoutUrl);
      expect(req.request.method).toBe('POST');
      req.flush(null, errorResponse); // Simulate a backend error on logout

      // Even on error, tokens should be cleared and navigation should occur
      expect(service.getAccessToken()).toBeNull();
      expect(service.isLoggedIn()).toBeFalse();
      expect(jwtCacheSpy.synchronizeAccessToken).toHaveBeenCalledWith(null);
      expect(jwtCacheSpy.synchronizeRefreshToken).toHaveBeenCalledWith(null);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh the access token when a refresh token is present', () => {
      const mockTokens: TokensModel = {access_token: 'newAccessToken', refresh_token: 'newRefreshToken'};

      // Service is already initialized with MOCK_INITIAL_REFRESH_TOKEN in beforeEach

      service.refreshAccessToken().subscribe(token => {
        expect(token).toBe(mockTokens.access_token);
        expect(service.getAccessToken()).toBe(mockTokens.access_token);
        expect(jwtCacheSpy.synchronizeAccessToken).toHaveBeenCalledWith(mockTokens.access_token);
        expect(jwtCacheSpy.synchronizeRefreshToken).toHaveBeenCalledWith(mockTokens.refresh_token);
      });

      const req = httpMock.expectOne(backendConfigSpy.authRoutes.refreshAccessTokenUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${MOCK_INITIAL_REFRESH_TOKEN}`);
      req.flush(mockTokens);
    });

    it('should handle unauthorized refresh, clear tokens, and redirect to login', () => {
      const errorResponse = new HttpErrorResponse({status: HttpStatusCode.Unauthorized, statusText: 'Unauthorized'});

      // Service is already initialized with tokens in beforeEach

      service.refreshAccessToken().subscribe({
        error: error => {
          expect(error.status).toBe(HttpStatusCode.Unauthorized);
          expect(service.getAccessToken()).toBeNull(); // Tokens should be cleared
          expect(service.isLoggedIn()).toBeFalse();
          expect(jwtCacheSpy.synchronizeAccessToken).toHaveBeenCalledWith(null);
          expect(jwtCacheSpy.synchronizeRefreshToken).toHaveBeenCalledWith(null);
          expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
        }
      });

      const req = httpMock.expectOne(backendConfigSpy.authRoutes.refreshAccessTokenUrl);
      expect(req.request.method).toBe('POST');
      req.flush(null, errorResponse);
    });

    it('should throw an error and call logout if no refresh token is available', (done) => {
      // For this specific test, we need to ensure the service *has* no refresh token.
      // We'll manually set the signals to null for this test scenario.
      (service as any).accessToken.set(null);
      (service as any).refreshToken.set(null);
      expect(service.isLoggedIn()).toBeFalse(); // Sanity check

      // Mock the `logout` method to prevent it from throwing its own internal error,
      // allowing `refreshAccessToken` to throw the expected 'No refresh token available.' error.
      // Also, make it return an observable as the actual logout method does.
      spyOn(service, 'logout').and.callFake(() => {
        (service as any).accessToken.set(null);
        (service as any).refreshToken.set(null);
        jwtCacheSpy.synchronizeAccessToken(null);
        jwtCacheSpy.synchronizeRefreshToken(null);
        routerSpy.navigate(['/login']);
        return of(true); // Simulate a successful logout observable
      });

      service.refreshAccessToken().subscribe({
        error: error => {
          expect(error.message).toBe('No refresh token available.');
          expect(service.logout).toHaveBeenCalled(); // Assert that logout was attempted
          expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
          expect(service.getAccessToken()).toBeNull();
          expect(service.isLoggedIn()).toBeFalse();
          httpMock.expectNone(backendConfigSpy.authRoutes.refreshAccessTokenUrl); // No HTTP request should be made
          done(); // Mark test as complete
        },
        complete: () => fail('Expected an error, but completed.')
      });
    });

    it('should only send a single refresh request if multiple calls occur concurrently', (done) => {
      const newTokens: TokensModel = {access_token: 'singleRequestAccessToken', refresh_token: 'singleRequestRefreshToken'};

      // Make sure the service is in a state where refresh can occur
      expect(service.isLoggedIn()).toBeTrue();

      // Start the first refresh request
      const firstRefresh$ = service.refreshAccessToken();

      // Immediately call refreshAccessToken again while the first is pending
      const secondRefresh$ = service.refreshAccessToken();

      // Expect only one HTTP request to be made
      const req = httpMock.expectOne(backendConfigSpy.authRoutes.refreshAccessTokenUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${MOCK_INITIAL_REFRESH_TOKEN}`);

      // Subscribe to both observables to ensure they both receive the same token
      let firstTokenReceived = false;
      let secondTokenReceived = false;

      firstRefresh$.subscribe(token => {
        expect(token).toBe(newTokens.access_token);
        firstTokenReceived = true;
        if (firstTokenReceived && secondTokenReceived) {
          done();
        }
      });

      secondRefresh$.subscribe(token => {
        expect(token).toBe(newTokens.access_token);
        secondTokenReceived = true;
        if (firstTokenReceived && secondTokenReceived) {
          done();
        }
      });

      // Respond to the HTTP request
      req.flush(newTokens);
    });

    it('should correctly set refreshTokenInProgress to false after a successful refresh', (done) => {
      const mockTokens: TokensModel = {access_token: 'finalAccessToken', refresh_token: 'finalRefreshToken'};
      expect((service as any).refreshTokenInProgress).toBeFalse();

      service.refreshAccessToken().subscribe(() => {
        // After the observable completes, refreshTokenInProgress should be false
        expect((service as any).refreshTokenInProgress).toBeFalse();
        done();
      });

      const req = httpMock.expectOne(backendConfigSpy.authRoutes.refreshAccessTokenUrl);
      req.flush(mockTokens);
      // It should be true while the request is pending
      expect((service as any).refreshTokenInProgress).toBeTrue();
    });

    it('should correctly set refreshTokenInProgress to false after a failed refresh', (done) => {
      const errorResponse = new HttpErrorResponse({status: HttpStatusCode.InternalServerError, statusText: 'Server Error'});
      expect((service as any).refreshTokenInProgress).toBeFalse();

      service.refreshAccessToken().subscribe({
        error: () => {
          // After the observable errors, refreshTokenInProgress should be false
          expect((service as any).refreshTokenInProgress).toBeFalse();
          done();
        }
      });

      const req = httpMock.expectOne(backendConfigSpy.authRoutes.refreshAccessTokenUrl);
      req.flush(null, errorResponse);
      // It should be true while the request is pending
      expect((service as any).refreshTokenInProgress).toBeTrue();
    });
  });
});
