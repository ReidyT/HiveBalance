package ch.reidyt.hivebalance.wallet.controllers;

import ch.reidyt.hivebalance.wallet.models.Currency;
import ch.reidyt.hivebalance.wallet.services.CurrencyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/currencies")
public class CurrencyController {
    private final CurrencyService currencyService;

    @GetMapping
    public ResponseEntity<List<Currency>> getAllCurrencies() {
        var currencies = currencyService.getAllCurrencies();

        return ResponseEntity.status(HttpStatus.OK).body(currencies);
    }
}
