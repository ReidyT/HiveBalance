import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BackendConfigService} from '../../shared/services/backend.config.service';
import {rxResource} from '@angular/core/rxjs-interop';
import {CurrencyResponseModel} from '../models/currency.response.model';

@Injectable({
  providedIn: 'root',
})
export class CurrencyService {
  private http = inject(HttpClient);
  private backendConfig = inject(BackendConfigService);

  public getAllCurrencies() {
    return rxResource({
      loader: () =>
        this.http.get<CurrencyResponseModel[]>(this.backendConfig.currencyRoutes.getAllCurrencies)
    })
  }
}
