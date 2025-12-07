import {inject, Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BackendConfigService} from '../../shared/services/backend.config.service';
import {GrantedWalletResponseModel} from '../models/granted.wallet.response.model';
import {rxResource} from '@angular/core/rxjs-interop';
import {CreateWalletRequestModel} from '../models/create.wallet.request.model';
import {CreateWalletResponseModel} from '../models/create.wallet.response.model';
import {of, tap} from 'rxjs';
import {WalletDetailsResponseModel} from '../models/wallet.details.response.model';
import {UpdateWalletRequestModel} from '../models/update.wallet.request.model';

@Injectable({
  providedIn: 'root',
})
export class WalletService {
  private http = inject(HttpClient);
  private backendConfig = inject(BackendConfigService);
  private readonly activeWalletId = signal<string | null>(null);

  public readonly grantedWallets = rxResource({
    loader: () =>
      this.http.get<GrantedWalletResponseModel[]>(this.backendConfig.walletRoutes.getGrantedWallets)
  });

  public createWallet(data: CreateWalletRequestModel) {
    return this.http.post<CreateWalletResponseModel>(
      this.backendConfig.walletRoutes.createWallet,
      data
    ).pipe(tap(() => this.grantedWallets.reload()));
  }

  public readonly walletDetails = rxResource({
    request: () => ({ id: this.activeWalletId() }),
    loader: ({ request }) => {
      if (!request.id) {
        return of(null);
      }

      return this.http.get<WalletDetailsResponseModel>(
        this.backendConfig.walletRoutes.getWalletDetails(request.id)
      );
    }
  });

  public setActiveWallet(id: string|null) {
    this.activeWalletId.set(id);
  }

  public updateWallet(id: string, data: UpdateWalletRequestModel) {
    return this.http.patch<void>(
      this.backendConfig.walletRoutes.patchWallet(id),
      data
    ).pipe(tap(() => {
      this.walletDetails.reload();
      this.grantedWallets.reload();
    }));
  }
}
