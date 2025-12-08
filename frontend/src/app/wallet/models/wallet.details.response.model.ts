import {CurrencyResponseModel} from '../../currency/models/currency.response.model';

export interface WalletDetailsResponseModel {
  id: string;
  name: string;
  currency: CurrencyResponseModel;
  createdAt: string;
}
