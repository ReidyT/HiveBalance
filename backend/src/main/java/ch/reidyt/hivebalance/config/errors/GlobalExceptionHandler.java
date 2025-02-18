package ch.reidyt.hivebalance.config.errors;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<BadRequestErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        BindingResult result = ex.getBindingResult();
        for (FieldError error : result.getFieldErrors()) {
            errors.put(error.getField(), error.getDefaultMessage());
        }

        return new ResponseEntity<>(
                new BadRequestErrorResponse(
                        "Bad Request",
                        "One or multiple fields are invalid.",
                        errors
                ),
                HttpStatus.BAD_REQUEST
        );
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolation() {
        // TODO: translate
        ErrorResponse message = new ErrorResponse(
                "Conflict error",
                "Try again with other information",
                HttpStatus.CONFLICT
        );
        return new ResponseEntity<>(message, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(Exception.class) // Handles all unhandled Exceptions
    public ResponseEntity<ErrorResponse> handleAnyException(Exception ex) {
        if (ex instanceof ErrorResponse errorResponse) {
            return new ResponseEntity<>(errorResponse, errorResponse.getStatusCode());
        } else {
            // TODO: translate
            ErrorResponse message = new ErrorResponse(
                    "Server error",
                    "Something went wrong. Try again later.",
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
            return new ResponseEntity<>(message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
