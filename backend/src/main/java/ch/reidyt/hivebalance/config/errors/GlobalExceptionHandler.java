package ch.reidyt.hivebalance.config.errors;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageConversionException;
import org.springframework.security.oauth2.jwt.BadJwtException;
import org.springframework.security.oauth2.jwt.JwtValidationException;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

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

        var message = new BadRequestErrorResponse(
                "Bad Request",
                "One or multiple fields are invalid.",
                errors
        );

        return new ResponseEntity<>(message, message.getStatusCode());
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolation() {
        // TODO: translate
        ErrorResponse message = new ErrorResponse(
                "Conflict error",
                "Try again with other information.",
                HttpStatus.CONFLICT
        );
        return new ResponseEntity<>(message, message.getStatusCode());
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErrorResponse> handleNoResourceFoundException() {
        // TODO: translate
        ErrorResponse message = new ErrorResponse(
                "ResourceNotFound",
                "The given path was not found.",
                HttpStatus.NOT_FOUND
        );
        return new ResponseEntity<>(message, message.getStatusCode());
    }

    @ExceptionHandler(HttpMessageConversionException.class)
    public ResponseEntity<ErrorResponse> handleHttpMessageConversionException(HttpMessageConversionException ex) {
        // TODO: translate
        ErrorResponse message = new ErrorResponse(
                "HttpMessageConversionException",
                "Required request body is missing.",
                HttpStatus.BAD_REQUEST
        );
        return new ResponseEntity<>(message, message.getStatusCode());
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentTypeMismatchException(MethodArgumentTypeMismatchException ex) {
        // TODO: translate
        ErrorResponse message = new ErrorResponse(
                "MethodArgumentTypeMismatchException",
                ex.getLocalizedMessage(),
                HttpStatus.BAD_REQUEST
        );
        return new ResponseEntity<>(message, message.getStatusCode());
    }

    @ExceptionHandler(JwtValidationException.class)
    public ResponseEntity<ErrorResponse> handleJwtValidationException(JwtValidationException ex) {
        ErrorResponse message = new ErrorResponse(
                "JwtValidationException",
                ex.getLocalizedMessage(),
                HttpStatus.UNAUTHORIZED
        );
        return new ResponseEntity<>(message, message.getStatusCode());
    }

    @ExceptionHandler(BadJwtException.class)
    public ResponseEntity<ErrorResponse> handleBadJwtException(BadJwtException ex) {
        ErrorResponse message = new ErrorResponse(
                "BadJwtException",
                ex.getLocalizedMessage(),
                HttpStatus.BAD_REQUEST
        );
        return new ResponseEntity<>(message, message.getStatusCode());
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
            return new ResponseEntity<>(message, message.getStatusCode());
        }
    }
}
