package ch.reidyt.hivebalance.security.services;

import ch.reidyt.hivebalance.security.dtos.TokensDTO;
import ch.reidyt.hivebalance.security.models.BeeUserDetails;
import ch.reidyt.hivebalance.security.models.JwtToken;
import ch.reidyt.hivebalance.security.models.Token;
import ch.reidyt.hivebalance.security.models.TokenType;
import ch.reidyt.hivebalance.security.repositories.TokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TokenService {

    private final TokenRepository tokenRepository;

    private final JwtTokenConverter tokenConverter;

    private UUID extractUserId(Authentication authentication) {
        if (authentication instanceof JwtAuthenticationToken jwtAuthentication) {
            return UUID.fromString(jwtAuthentication.getName());
        } else if (authentication instanceof UsernamePasswordAuthenticationToken usernamePasswordAuthentication) {
            return ((BeeUserDetails) usernamePasswordAuthentication.getPrincipal()).getId();
        }

        throw new RuntimeException("The authentication is not valid. No userId was found.");
    }

    private String generateToken(Authentication authentication, TokenType tokenType) {
        return tokenConverter.encode(extractUserId(authentication), authentication, tokenType);
    }

    private void saveTokenPair(String refreshTokenString, String accessTokenString, UUID parentId) {
        var refreshToken = Token.from(tokenConverter.decode(refreshTokenString).orElseThrow(), parentId);
        var accessToken = Token.from(tokenConverter.decode(accessTokenString).orElseThrow(), refreshToken.getTokenId());

        tokenRepository.saveAll(List.of(refreshToken, accessToken));
    }

    public TokensDTO generateTokenPair(Authentication authentication, String parentTokenString) {
        var refreshToken = generateToken(authentication, TokenType.REFRESH_TOKEN);
        var accessToken = generateToken(authentication, TokenType.ACCESS_TOKEN);
        
        var parentToken = tokenConverter.decode(parentTokenString);
        var parentId = parentToken.map(JwtToken::getTokenId).orElse(null);

        if (parentId != null) {
            tokenRepository.blacklistByRefreshToken(parentId);
        }

        // Important to blacklist before saving to not blacklist created tokens.
        saveTokenPair(refreshToken, accessToken, parentId);

        return TokensDTO.builder().accessToken(accessToken).refreshToken(refreshToken).build();
    }

    public void blacklistAllUserTokens(String tokenString) {
        var userId = tokenConverter.decode(tokenString).orElseThrow().getUserId();
        if (userId == null) {
            throw new IllegalArgumentException("The given token doesn't contain the user id.");
        }

        tokenRepository.blacklistByUserId(userId);
    }

    public void userLogOut(String accessTokenString) {
        var accessTokenId = tokenConverter.decode(accessTokenString).orElseThrow().getTokenId();
        if (accessTokenId == null) {
            throw new IllegalArgumentException("The given refresh token cannot be null.");
        }

        tokenRepository.blacklistByAccessToken(accessTokenId);
    }

    public boolean isTokenBlacklisted(String tokenString) {
        var tokenId = tokenConverter.decode(tokenString).orElseThrow().getTokenId();

        return tokenRepository.isBlacklisted(tokenId);
    }

    public boolean isRefreshToken(String tokensString) {
        try {
            return tokenConverter.decode(tokensString).orElseThrow().getTokenType().equals(TokenType.REFRESH_TOKEN);
        } catch (JwtException e) {
            return false;
        }
    }
}
