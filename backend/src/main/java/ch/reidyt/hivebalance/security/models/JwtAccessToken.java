package ch.reidyt.hivebalance.security.models;

import java.util.HashMap;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

public class JwtAccessToken extends JwtToken {
    public JwtAccessToken(UUID userId, Long expiresInMillis, Authentication authentication) {
        super(userId, expiresInMillis, TokenType.ACCESS_TOKEN, createScopeClaim(authentication));
    }

    private static HashMap<String, Object> createScopeClaim(Authentication authentication) {
        String scope = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(authority -> !authority.startsWith("ROLE"))
                .collect(Collectors.joining(" "));

        var customClaims = new HashMap<String, Object>();
        customClaims.put("scope", scope);

        return customClaims;
    }
}
