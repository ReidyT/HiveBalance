package ch.reidyt.hivebalance.config;

import ch.reidyt.hivebalance.config.errors.ErrorResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.InsufficientAuthenticationException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;

import java.io.IOException;
import java.util.List;

public class LoginAuthEntryPoint implements AuthenticationEntryPoint {
    private final ObjectMapper objectMapper = new ObjectMapper();

    // List of trusted exceptions (if not in this list, a generic error will be sent).
    private final List<Class<? extends AuthenticationException>> authenticationExceptions = List.of(
            BadCredentialsException.class,
            InsufficientAuthenticationException.class
    );

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) {
        if (authenticationExceptions.contains(authException.getClass())) {
            sendErrorResponse(response, HttpStatus.UNAUTHORIZED, "Authentication Failed", authException.getLocalizedMessage());
        } else {
            sendErrorResponse(response, HttpStatus.INTERNAL_SERVER_ERROR, "Server Error", "An error occurred. Please try again later.");
        }
    }

    private void sendErrorResponse(HttpServletResponse response, HttpStatus status, String title, String message) {
        try {
            response.setStatus(status.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            var errorResponse = new ErrorResponse(title, message, status);
            objectMapper.writeValue(response.getWriter(), errorResponse);
        } catch (IOException e) {
            System.err.println(e.getMessage());
        }
    }
}
