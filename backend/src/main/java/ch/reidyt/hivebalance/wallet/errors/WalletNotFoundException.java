package ch.reidyt.hivebalance.wallet.errors;

import ch.reidyt.hivebalance.config.errors.ErrorResponse;
import org.springframework.http.HttpStatus;

import java.util.UUID;

public class WalletNotFoundException extends ErrorResponse {
    // TODO: translate
    private static final String TITLE = "Given wallet not found";
    private static final String MESSAGE = "The given wallet with id \"%s\" was not found.";
    private static final HttpStatus HTTP_CODE = HttpStatus.NOT_FOUND;

    public WalletNotFoundException(UUID walletId) {
        super(TITLE, String.format(MESSAGE, walletId), HTTP_CODE);
    }
}
