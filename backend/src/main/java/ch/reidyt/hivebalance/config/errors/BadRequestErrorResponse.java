package ch.reidyt.hivebalance.config.errors;

import org.springframework.http.HttpStatus;

import java.util.Map;

public class BadRequestErrorResponse extends ErrorResponse {
    public BadRequestErrorResponse(String title, String message, Map<String, String> details) {
        super(title, formatDetails(message, details), HttpStatus.BAD_REQUEST);
    }

    private static String formatDetails(String message, Map<String, String> details) {
        StringBuilder result = new StringBuilder(message);
        result.append("\n");
        for (String key : details.keySet()) {
            result.append(details.get(key));
            result.append("\n");
        }

        return result.toString();
    }
}
