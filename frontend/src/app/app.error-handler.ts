import {HttpErrorResponse, HttpInterceptorFn, HttpStatusCode} from '@angular/common/http';
import {inject} from '@angular/core';
import {catchError, throwError} from 'rxjs';
import {MessageService} from 'primeng/api';
import {ErrorResponseModel} from './shared/models/error-response.model';

export const globalErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);

  return next(req).pipe(
    catchError((httpErrorResponse: HttpErrorResponse) => {
      const error = httpErrorResponse.error as ErrorResponseModel;

      // TODO: translate
      let title = error.title ?? 'Error';
      let message = error.message ?? 'An error occurred';

      messageService.add({severity: 'error', summary: title, detail: message, life: 5_000});
      return throwError(() => httpErrorResponse);
    })
  );
};
