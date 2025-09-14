import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BackendConfigService} from '../../shared/services/backend.config.service';
import {GrantedWalletResponseModel} from '../models/granted.wallet.response.model';
import {rxResource} from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class WalletService {
  private http = inject(HttpClient);
  private backendConfig = inject(BackendConfigService);

  public getAllGrantedWallets() {
    return rxResource({
      loader: () =>
        this.http.get<GrantedWalletResponseModel[]>(this.backendConfig.walletRoutes.getGrantedWallets)
    })
  }
}
