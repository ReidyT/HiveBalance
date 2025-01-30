package ch.reidyt.hivebalance.security.models;

import java.util.UUID;

public class JwtRefreshToken extends JwtToken {

    public JwtRefreshToken(UUID userId, Long expiresInMillis) {
        super(userId, expiresInMillis, TokenType.REFRESH_TOKEN, null);
    }
}
