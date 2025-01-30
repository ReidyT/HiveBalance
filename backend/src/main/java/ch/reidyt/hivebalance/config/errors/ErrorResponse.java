package ch.reidyt.hivebalance.config.errors;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class ErrorResponse extends Throwable {
    private final int statusCode;
    private final String message;
}
