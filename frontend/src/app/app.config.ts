import {ApplicationConfig, provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {providePrimeNG} from 'primeng/config';
import {HiveBalancePreset} from '../hiveBalancePreset';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {authInterceptor} from './authentication/interceptors/auth.interceptor';
import {MessageService} from 'primeng/api';
import {globalErrorInterceptor} from './app.error-handler';

export const appConfig: ApplicationConfig = {
  providers: [
    MessageService,
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes),
    // The order of interceptors is critical for the error handling flow.
    // For outgoing requests, they run in the provided order: global -> auth.
    // For incoming responses (and errors), they run in REVERSE order: auth -> global.
    // This allows the authInterceptor to catch 401 errors and attempt a token
    // refresh before the globalErrorInterceptor tries to display a generic error message.
    provideHttpClient(withInterceptors([globalErrorInterceptor, authInterceptor])),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: HiveBalancePreset,
      }
    }),
  ]
};
