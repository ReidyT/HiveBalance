package ch.reidyt.hivebalance.user.errors;

import ch.reidyt.hivebalance.config.errors.ErrorResponse;
import org.springframework.http.HttpStatus;

public class UserNotFoundException extends ErrorResponse {
    // TODO: translate
    private static final String TITLE = "Given user id does not exist";
    private static final String MESSAGE = "The given user id %s is not a valid one.";
    private static final HttpStatus HTTP_CODE = HttpStatus.BAD_REQUEST;

    public UserNotFoundException(String currencyCode) {
        super(TITLE, String.format(MESSAGE, currencyCode), HTTP_CODE);
    }
}
