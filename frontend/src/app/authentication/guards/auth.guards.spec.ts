import {TestBed} from '@angular/core/testing';
import {ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot} from '@angular/router';
import {authGuard} from './auth.guard';
import {AuthenticationService} from '../services/authentication.service';


describe('authGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  let authService: jasmine.SpyObj<AuthenticationService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    // Create a spy object for AuthenticationService
    authService = jasmine.createSpyObj<AuthenticationService>('AuthenticationService', ['isLoggedIn']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['parseUrl']);

    TestBed.configureTestingModule({
      providers: [{provide: Router, useValue: routerSpy}, {provide: AuthenticationService, useValue: authService}]
    });

  });

  it('should return true if user is logged in', () => {
    authService.isLoggedIn.and.returnValue(true);

    expect(executeGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)).toBeTrue();
  });

  it('should redirect to /auth/login if user is not logged in', () => {
    authService.isLoggedIn.and.returnValue(false);

    executeGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);

    expect(routerSpy.parseUrl).toHaveBeenCalledWith('/auth/login');
  });
});
