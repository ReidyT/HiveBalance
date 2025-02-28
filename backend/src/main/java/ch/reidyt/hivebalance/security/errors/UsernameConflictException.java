package ch.reidyt.hivebalance.security.errors;

import ch.reidyt.hivebalance.config.errors.ErrorResponse;
import org.springframework.http.HttpStatus;

public class UsernameConflictException extends ErrorResponse {
    // TODO: translate
    private static final String TITLE = "Given username already exist";
    private static final String MESSAGE = "The given username %s already exist. Please try again with another username.";
    private static final HttpStatus HTTP_CODE = HttpStatus.CONFLICT;

    public UsernameConflictException(String username) {
        super(TITLE, String.format(MESSAGE, username), HTTP_CODE);
    }
}