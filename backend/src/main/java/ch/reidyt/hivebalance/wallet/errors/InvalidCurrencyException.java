package ch.reidyt.hivebalance.wallet.errors;

import ch.reidyt.hivebalance.config.errors.ErrorResponse;
import org.springframework.http.HttpStatus;

public class InvalidCurrencyException extends ErrorResponse {
    // TODO: translate
    private static final String TITLE = "Given currency does not exist";
    private static final String MESSAGE = "The given currency \"%s\" is not a valid one.";
    private static final HttpStatus HTTP_CODE = HttpStatus.BAD_REQUEST;

    public InvalidCurrencyException(String currencyCode) {
        super(TITLE, String.format(MESSAGE, currencyCode), HTTP_CODE);
    }
}
