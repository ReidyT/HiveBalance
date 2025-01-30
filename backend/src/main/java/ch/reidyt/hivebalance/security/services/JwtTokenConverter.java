package ch.reidyt.hivebalance.security.services;

import java.util.Optional;
import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Component;

import ch.reidyt.hivebalance.config.JwtProperties;
import ch.reidyt.hivebalance.security.models.JwtAccessToken;
import ch.reidyt.hivebalance.security.models.JwtRefreshToken;
import ch.reidyt.hivebalance.security.models.JwtToken;
import ch.reidyt.hivebalance.security.models.TokenType;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtTokenConverter {

    private final JwtProperties jwtProperties;

    private final JwtEncoder jwtEncoder;

    private final JwtDecoder jwtDecoder;

    public Optional<JwtToken> decode(String tokenString) {
        if (tokenString != null) {
            return Optional.of(JwtToken.from(jwtDecoder.decode(tokenString)));
        }

        return Optional.empty();
    }

    public String encode(JwtToken jwtToken) {
        var header = JwsHeader.with(MacAlgorithm.HS512).build();
        var claims = jwtToken.getClaims();
        var encoderParameters = JwtEncoderParameters.from(header, claims);
        return jwtEncoder.encode(encoderParameters).getTokenValue();
    }

    public String encode(UUID userId, Authentication authentication, TokenType tokenType) {
        if (tokenType.equals(TokenType.REFRESH_TOKEN)) {
            return encode(new JwtRefreshToken(userId, jwtProperties.getRefreshTokenExpiration()));
        }
        return encode(new JwtAccessToken(userId, jwtProperties.getExpiration(), authentication));
    }
}
