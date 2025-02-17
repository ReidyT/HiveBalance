import {HttpHandlerFn, HttpInterceptorFn, HttpRequest} from '@angular/common/http';
import {inject} from '@angular/core';
import {AuthenticationService} from '../services/authentication.service';
import {catchError, switchMap, throwError} from 'rxjs';
import {BackendConfigService} from '../../shared/services/backend.config.service';

const addAccessToken = (req: HttpRequest<unknown>, accessToken: string | null) => {
  if (accessToken) {
    return req.clone({
      setHeaders: {Authorization: `Bearer ${accessToken}`},
    });
  }

  return req;
};

const handleTokenExpired = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthenticationService,
) => {
  return authService.refreshAccessToken().pipe(
    switchMap((newAccessToken) => {
      if (typeof newAccessToken === 'string') {
        // Retry the original request with the new access token
        return next(addAccessToken(req, newAccessToken));
      }

      // This should never happen.
      return throwError(() => new Error('There is no access token'));
    }),
    catchError((error) => {
      console.error('Error handling expired access token:', error);
      return throwError(() => error);
    })
  );
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthenticationService);
  const backendConfig = inject(BackendConfigService);
  const accessToken = authService.getAccessToken();

  if (req.url.startsWith(backendConfig.apiUrl)) {
    const authReq = addAccessToken(req, accessToken);
    return next(authReq).pipe(
      catchError((error) => {
        // Check if the error is due to an expired access token
        if (error.status === 401 && accessToken) {
          handleTokenExpired(req, next, authService);
        }

        return throwError(() => error);
      })
    );
  }

  return next(req);
};
