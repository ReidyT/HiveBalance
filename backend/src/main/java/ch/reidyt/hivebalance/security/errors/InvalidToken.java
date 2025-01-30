package ch.reidyt.hivebalance.security.errors;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class InvalidToken {
    private final String message = "The given token is invalid.";
}
