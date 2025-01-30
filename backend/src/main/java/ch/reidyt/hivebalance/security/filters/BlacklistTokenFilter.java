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
public class BlacklistTokenFilter extends OncePerRequestFilter {
    private final TokenService tokenService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        String authorizationHeader = request.getHeader("Authorization");

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            String token = authorizationHeader.substring(7);

            // Check if the token is blacklisted
            if (tokenService.isTokenBlacklisted(token)) {
                tokenService.blacklistAllUserTokens(token);

                // Set response status and content type
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);

                // Create the JSON error response
                var errorResponse = new HashMap<>();
                errorResponse.put("error", "Unauthorized");
                errorResponse.put("message", "The given token is blacklisted.");

                // Write the JSON to the response
                objectMapper.writeValue(response.getWriter(), errorResponse);
                return; // Stop further processing
            }
        }

        filterChain.doFilter(request, response);
    }
}