package ch.reidyt.hivebalance.security.errors;

import ch.reidyt.hivebalance.config.errors.ErrorResponse;
import org.springframework.http.HttpStatus;

public class EmailConflictException extends ErrorResponse {
    // TODO: translate
    private static final String TITLE = "Given email already exist";
    private static final String MESSAGE = "The given email %s already exist. Please try again with another email.";
    private static final HttpStatus HTTP_CODE = HttpStatus.CONFLICT;

    public EmailConflictException(String email) {
        super(TITLE, String.format(MESSAGE, email), HTTP_CODE);
    }
}