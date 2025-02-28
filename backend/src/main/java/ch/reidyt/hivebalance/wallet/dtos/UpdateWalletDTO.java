package ch.reidyt.hivebalance.wallet.dtos;

import ch.reidyt.hivebalance.wallet.validators.CurrencyCode;
import ch.reidyt.hivebalance.wallet.validators.WalletName;
import jakarta.validation.constraints.Size;

public record UpdateWalletDTO(
        @WalletName
        @Size(min = 1, max = 30, message = "Name must be between 1 and 30 characters")
        String name,

        @CurrencyCode
        @Size(min = 1, max = 5, message = "Currency code must be between 1 and 5 characters")
        String currencyCode
) {
}
