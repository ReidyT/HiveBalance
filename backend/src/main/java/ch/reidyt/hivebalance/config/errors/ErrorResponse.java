package ch.reidyt.hivebalance.config.errors;

import com.fasterxml.jackson.annotation.JsonGetter;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public class ErrorResponse extends RuntimeException {
    private final String title;

    private final String message;

    private final HttpStatus statusCode;

    // Use @JsonGetter to define how statusCode should be serialized
    @JsonGetter("statusCode")
    public int getStatusCodeValue() {
        return statusCode.value();
    }
}
