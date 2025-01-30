package ch.reidyt.hivebalance.security.filters;

import ch.reidyt.hivebalance.security.services.TokenService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.HashMap;

@RequiredArgsConstructor
public class RefreshTokenBlockingFilter extends OncePerRequestFilter {

    private final TokenService tokenService;

    private final String refreshTokenUrl;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        // Skip filtering for the refresh-token route
        if (refreshTokenUrl.equals(request.getRequestURI())) {
            filterChain.doFilter(request, response);
            return;
        }

        String authorizationHeader = request.getHeader("Authorization");

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            String token = authorizationHeader.substring(7);

            if (tokenService.isRefreshToken(token)) {
                // Set response status and content type
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);

                // Create the JSON error response
                var errorResponse = new HashMap<>();
                errorResponse.put("error", "Forbidden");
                errorResponse.put("message", "Refresh tokens are not allowed on this route.");

                // Write the JSON to the response
                objectMapper.writeValue(response.getWriter(), errorResponse);
                return; // Stop further processing
            }
        }

        // Proceed with the request if the token is not a refresh token
        filterChain.doFilter(request, response);
    }
}