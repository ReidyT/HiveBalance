package ch.reidyt.hivebalance.wallet.dtos;

import ch.reidyt.hivebalance.wallet.models.Currency;
import ch.reidyt.hivebalance.wallet.models.Wallet;
import ch.reidyt.hivebalance.wallet.validators.CurrencyCode;
import ch.reidyt.hivebalance.wallet.validators.WalletName;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateWalletDTO(
        @WalletName
        @NotBlank(message = "Name cannot be blank")
        @Size(min = 1, max = 30, message = "Name must be between 1 and 30 characters")
        String name,

        @CurrencyCode
        @NotBlank(message = "Currency code cannot be blank")
        @Size(min = 1, max = 5, message = "Currency code must be between 1 and 5 characters")
        String currencyCode
) {
    public Wallet toWallet(Currency currency) {
        return Wallet.builder().name(name).currency(currency).build();
    }
}
