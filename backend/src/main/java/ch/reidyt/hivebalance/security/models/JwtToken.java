package ch.reidyt.hivebalance.security.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.UUID;

@Builder
@AllArgsConstructor
@Getter
public class JwtToken {
    private static final String TOKEN_ID_CLAIM_NAME = "uuid";

    private static final String TOKEN_TYPE_CLAIM_NAME = "type";

    private static final String issuer = "self";

    private UUID userId; // subject

    private UUID tokenId;

    private Instant issuedAt;

    private Instant expiresAt;

    private TokenType tokenType;

    private JwtClaimsSet claims;

    public JwtToken(UUID userId, Long expiresInMillis, TokenType tokenType, HashMap<String, Object> customClaims) {
        this.tokenId = UUID.randomUUID();
        this.userId = userId;
        this.issuedAt = Instant.now();
        this.expiresAt = this.issuedAt.plus(expiresInMillis, ChronoUnit.MILLIS);
        this.tokenType = tokenType;
        this.claims = generateClaims(customClaims);
    }

    public static JwtToken from(Jwt jwt) {
        try {
            var tokenType = TokenType.valueOf(jwt.getClaim(TOKEN_TYPE_CLAIM_NAME));

            return JwtToken
                    .builder()
                    .userId(UUID.fromString(jwt.getSubject()))
                    .tokenId(UUID.fromString(jwt.getClaimAsString(TOKEN_ID_CLAIM_NAME)))
                    .tokenType(tokenType)
                    .issuedAt(jwt.getIssuedAt())
                    .expiresAt(jwt.getExpiresAt())
                    .claims(JwtClaimsSet.builder()
                            .claims(stringObjectMap -> stringObjectMap.putAll(jwt.getClaims())).build())
                    .build();
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("The given jwt type is not valid.");
        } catch (Exception e) {
            throw new IllegalArgumentException("The given jwt is not a valid JwtToken.");
        }

    }

    private JwtClaimsSet generateClaims(HashMap<String, Object> customClaims) {
        var claimSet = JwtClaimsSet
                .builder()
                .issuer(issuer)
                .issuedAt(issuedAt)
                .expiresAt(expiresAt)
                .subject(userId.toString())
                .claim(TOKEN_ID_CLAIM_NAME, tokenId)
                .claim(TOKEN_TYPE_CLAIM_NAME, tokenType);

        if (customClaims != null) {
            for (var customClaim : customClaims.entrySet()) {
                claimSet.claim(customClaim.getKey(), customClaim.getValue());
            }
        }

        return claimSet.build();
    }
}
