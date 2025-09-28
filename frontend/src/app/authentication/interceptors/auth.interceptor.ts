// src/app/core/interceptors/auth.interceptor.ts

import {HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpStatusCode} from '@angular/common/http';
import {inject} from '@angular/core';
import {AuthenticationService} from '../services/authentication.service';
import {catchError, switchMap, throwError} from 'rxjs';
import {BackendConfigService} from '../../shared/services/backend.config.service';
import {MessageService} from 'primeng/api';

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
  messageService: MessageService,
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
    }),
    catchError((error) => {
      // The refresh token request failed. The authService should have already handled logout.
      // TODO: translate
      messageService.add({
        severity: 'error',
        summary: 'Session Expired',
        detail: 'Your session has expired. Please log in again.',
        life: 5_000
      });

      // Re-throw the error to ensure the original call that triggered this fails.
      return throwError(() => error);
    })
  );
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthenticationService);
  const backendConfig = inject(BackendConfigService);
  const messageService = inject(MessageService);
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
        if (error instanceof HttpErrorResponse && error.status === HttpStatusCode.Unauthorized && accessToken !== null) {
          return handleTokenExpired(req, next, authService, messageService);
        }

        return throwError(() => error);
      })
    );
  }

  return next(req);
};
