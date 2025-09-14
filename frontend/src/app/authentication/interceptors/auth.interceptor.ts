// src/app/core/interceptors/auth.interceptor.ts

import {HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpStatusCode} from '@angular/common/http';
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
      // This part is only reached if the refresh is successful
      if (typeof newAccessToken === 'string') {
        // Retry the original request with the new access token
        return next(addAccessToken(req, newAccessToken));
      }

      // This should not happen if the backend is consistent, but it's a safe fallback.
      authService.logout();
      return throwError(() => new Error('There is no access token'));
    })
    // No catchError needed here. The service's catchError handles the logout
    // and throws an error that should propagate to the original caller.
  );
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthenticationService);
  const backendConfig = inject(BackendConfigService);
  const accessToken = authService.getAccessToken();

  if (req.url.startsWith(backendConfig.apiUrl)) {
    // Do not attempt to add a token to the refresh token request itself
    if (req.url === backendConfig.authRoutes.refreshAccessTokenUrl) {
      return next(req);
    }

    const authReq = addAccessToken(req, accessToken);

    return next(authReq).pipe(
      catchError((error: unknown) => {
        // Check if the error is a 401 and that we were trying to use an access token.
        if (error instanceof HttpErrorResponse && error.status === HttpStatusCode.Unauthorized && accessToken) {
          return handleTokenExpired(req, next, authService);
        }

        return throwError(() => error);
      })
    );
  }

  return next(req);
};
