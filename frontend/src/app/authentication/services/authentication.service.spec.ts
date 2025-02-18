import {TestBed} from '@angular/core/testing';
import {AuthenticationService} from './authentication.service';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {Router} from '@angular/router';
import {HttpErrorResponse, HttpStatusCode, provideHttpClient} from '@angular/common/http';
import {TokensModel} from '../models/tokens.model';
import {RegistrationModel} from '../models/registration.model';
import {JwtCacheService} from './jwt.cache.service';
import {BackendConfigService} from '../../shared/services/backend.config.service';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;
  let jwtCacheSpy: jasmine.SpyObj<JwtCacheService>;
  let backendConfigSpy: jasmine.SpyObj<BackendConfigService>;

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
  });

  describe('registerWithRedirect', () => {
    it('should register user and navigate to redirect URL', () => {
      const mockTokens: TokensModel = {access_token: 'mockAccessToken', refresh_token: 'mockRefreshToken'};
      const userRegistration: RegistrationModel = {email: '', username: 'testUser', password: 'testPass'};
      const redirectTo = '/';

      service.registerWithRedirect(userRegistration, redirectTo).subscribe(success => {
        expect(success).toBeTrue();
      });

      const req = httpMock.expectOne(backendConfigSpy.authRoutes.registrationUrl);
      expect(req.request.method).toBe('POST');
      req.flush(mockTokens);

      expect(routerSpy.navigate).toHaveBeenCalledWith([redirectTo]);
    });

    it('should handle registration error', () => {
      const errorResponse = new HttpErrorResponse({status: 400, statusText: 'Bad Request'});

      service.registerWithRedirect({username: 'test', password: '1234'} as unknown as RegistrationModel).subscribe({
        error: error => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(backendConfigSpy.authRoutes.registrationUrl);
      req.flush({message: 'Error'}, errorResponse);
    });
  });

  describe('loginWithRedirect', () => {
    it('should log in user and navigate to redirect URL', () => {
      const mockTokens: TokensModel = {access_token: 'mockAccessToken', refresh_token: 'mockRefreshToken'};
      const credentials = {usernameOrEmail: 'testUser', password: 'testPass'};

      service.loginWithRedirect(credentials).subscribe(success => {
        expect(success).toBeTrue();
      });

      const req = httpMock.expectOne(backendConfigSpy.authRoutes.loginUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Authorization')).toBe('Basic ' + btoa(`${credentials.usernameOrEmail}:${credentials.password}`));
      req.flush(mockTokens);

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should handle login failure due to unauthorized error', () => {
      const errorResponse = new HttpErrorResponse({status: HttpStatusCode.Unauthorized, statusText: 'Unauthorized'});

      service.loginWithRedirect({usernameOrEmail: 'test', password: 'wrongPass'}).subscribe({
        error: error => {
          expect(error.status).toBe(HttpStatusCode.Unauthorized);
        }
      });

      const req = httpMock.expectOne(backendConfigSpy.authRoutes.loginUrl);
      req.flush({message: 'Unauthorized'}, errorResponse);
    });
  });

  describe('logout', () => {
    it('should log out user and navigate to /login', () => {
      spyOn(service, 'isLoggedIn').and.returnValue(true);

      service.logout().subscribe(success => {
        expect(success).toBeTrue();
      });

      const req = httpMock.expectOne(backendConfigSpy.authRoutes.logoutUrl);
      expect(req.request.method).toBe('POST');
      req.flush(null);

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should throw an error if user is not logged in', () => {
      spyOn(service, 'isLoggedIn').and.returnValue(false);

      expect(() => service.logout()).toThrowError('Not logged in! You cannot log out.');
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh the access token', () => {
      const mockTokens: TokensModel = {access_token: 'newAccessToken', refresh_token: 'newRefreshToken'};

      service.refreshAccessToken().subscribe(token => {
        expect(token).toBe(mockTokens.access_token);
      });

      const req = httpMock.expectOne(backendConfigSpy.authRoutes.refreshAccessTokenUrl);
      expect(req.request.method).toBe('POST');
      req.flush(mockTokens);
    });

    it('should handle unauthorized refresh and redirect to login', () => {
      const errorResponse = new HttpErrorResponse({status: HttpStatusCode.Unauthorized, statusText: 'Unauthorized'});

      service.refreshAccessToken().subscribe({
        error: async error => {
          expect(error.status).toBe(HttpStatusCode.Unauthorized);
          expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
        }
      });

      const req = httpMock.expectOne(backendConfigSpy.authRoutes.refreshAccessTokenUrl);
      req.flush(null, errorResponse);
    });
  });
});
