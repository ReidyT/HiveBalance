import {inject, Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BackendConfigService} from '../../shared/services/backend.config.service';
import {GrantedWalletResponseModel} from '../models/granted.wallet.response.model';
import {tap} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WalletService {
  private http = inject(HttpClient);
  private backendConfig = inject(BackendConfigService);
  public grantedWallets = signal<GrantedWalletResponseModel[]>([]);

  public getAllGrantedWallets() {
    return this.http.get<GrantedWalletResponseModel[]>(this.backendConfig.walletRoutes.getGrantedWallets).pipe(
      tap(wallets => this.grantedWallets.set(wallets))
    );
  }
}
