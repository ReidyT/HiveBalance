package ch.reidyt.hivebalance.wallet.services;

import ch.reidyt.hivebalance.wallet.models.Currency;
import ch.reidyt.hivebalance.wallet.repositories.CurrencyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CurrencyService {

    private final CurrencyRepository currencyRepository;

    public List<Currency> getAllCurrencies() {
        return currencyRepository.findAll();
    }
}
