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
    provideHttpClient(withInterceptors([authInterceptor, globalErrorInterceptor])),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: HiveBalancePreset,
      }
    }),
  ]
};
