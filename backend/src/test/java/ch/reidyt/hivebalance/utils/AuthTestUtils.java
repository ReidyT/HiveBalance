package ch.reidyt.hivebalance.utils;


import ch.reidyt.hivebalance.security.dtos.TokensDTO;
import ch.reidyt.hivebalance.security.dtos.UserRegistrationDTO;
import org.junit.jupiter.api.Assertions;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;
import org.springframework.stereotype.Component;

/**
 * Utility class for testing authentication and authorization flows.
 */
@Component
public class AuthTestUtils extends HttpTestUtils {

    private static final String PROTECTED_ROUTE = "/checks/auth";
    private static final String REGISTER_ROUTE = "/auth/register";
    private static final String LOGIN_ROUTE = "/auth/login";
    private static final String REFRESH_TOKEN_ROUTE = "/auth/refresh-token";
    private static final String LOGOUT_ROUTE = "/auth/logout";

    public AuthTestUtils(TestRestTemplate restTemplate) {
        super(restTemplate);
    }

    /**
     * Registers a new user.
     *
     * @param registration The user to register.
     * @return The ResponseEntity containing the access and refresh tokens.
     */
    public ResponseEntity<TokensDTO> registerUser(UserRegistrationDTO registration) {
        return restTemplate.postForEntity(REGISTER_ROUTE, registration, TokensDTO.class);
    }

    /**
     * Logs in an existing user.
     *
     * @param usernameOrEmail The user's username or email.
     * @param password        The user's password.
     * @return The ResponseEntity containing the access and refresh tokens.
     */
    public ResponseEntity<TokensDTO> loginUser(String usernameOrEmail, String password) {
        return restTemplate.withBasicAuth(usernameOrEmail, password)
                .postForEntity(LOGIN_ROUTE, null, TokensDTO.class);
    }

    /**
     * Logs out a user using their access token.
     *
     * @param accessToken The user's access token.
     */
    public void logoutUser(String accessToken) {
        restTemplate.postForEntity(LOGOUT_ROUTE, httpEntityFactory(accessToken), String.class);
    }

    /**
     * Asserts that accessing a protected resource with the given token results in the expected HTTP status.
     *
     * @param token          The token to use for accessing the protected resource.
     * @param expectedStatus The expected HTTP status code.
     */
    public void assertProtectedResource(String token, HttpStatus expectedStatus) {
        super.assertProtectedResource(PROTECTED_ROUTE, token, expectedStatus);
    }

    /**
     * Asserts that accessing a protected resource with the given token (or no token) results in a 401 Unauthorized status.
     *
     * @param token The token used to try to access to the route. Can be null or invalid.
     */
    public void assertProtectedResourceUnauthorized(String token) {
        this.assertProtectedResource(token, HttpStatus.UNAUTHORIZED);
    }

    /**
     * Asserts that accessing a protected resource with the given access token results in a 200 OK status.
     *
     * @param accessToken The valid access token.
     */
    public void assertProtectedResourceOk(String accessToken) {
        this.assertProtectedResource(accessToken, HttpStatus.OK);
    }

    /**
     * Refreshes an access token using a refresh token.
     *
     * @param refreshToken The user's refresh token.
     * @return The ResponseEntity containing the new access and refresh tokens.
     */
    public ResponseEntity<TokensDTO> refreshToken(String refreshToken) {
        return restTemplate.postForEntity(REFRESH_TOKEN_ROUTE, httpEntityFactory(refreshToken), TokensDTO.class);
    }

    /**
     * Asserts that the response entity contains valid (non-null) tokens.
     *
     * @param response The ResponseEntity containing the TokensDTO.
     * @return The TokensDTO object, if it is valid.
     * @throws AssertionError if the TokensDTO or its access/refresh tokens are null.
     */
    public TokensDTO assertNotNullTokens(ResponseEntity<TokensDTO> response) {
        TokensDTO tokens = response.getBody();
        Assertions.assertNotNull(tokens);
        Assertions.assertNotNull(tokens.getAccessToken());
        Assertions.assertNotNull(tokens.getRefreshToken());
        return tokens;
    }

    /**
     * Asserts that attempting to refresh a token with the given refresh token results in a 401 Unauthorized status.
     * This indicates that the refresh token is invalid (e.g., expired, revoked, or already used).
     *
     * @param refreshToken The refresh token to use for the refresh attempt.
     */
    public void assertRefreshTokenInvalid(String refreshToken) {
        var refreshResponse = refreshToken(refreshToken);
        Assertions.assertEquals(HttpStatus.UNAUTHORIZED.value(), refreshResponse.getStatusCode().value());
    }
}