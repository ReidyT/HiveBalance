import {CurrencyResponseModel} from '../../currency/models/currency.response.model';

export interface CreateWalletResponseModel {
  id: string;
  name: string;
  currency: CurrencyResponseModel;
  createdAt: string;
}
