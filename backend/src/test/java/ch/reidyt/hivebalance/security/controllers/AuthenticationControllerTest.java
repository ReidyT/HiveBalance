package ch.reidyt.hivebalance.security.controllers;

import ch.reidyt.hivebalance.security.dtos.UserRegistrationDTO;
import ch.reidyt.hivebalance.utils.AuthTestUtils;
import ch.reidyt.hivebalance.utils.MockUserUtils;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.Arrays;
import java.util.Random;

@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class AuthenticationControllerTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17.2");
    static int seed = new Random().nextInt();
    static MockUserUtils userUtils = MockUserUtils.builder().seed(seed).build();
    @Autowired
    AuthTestUtils utils;
    @Autowired
    private AuthTestUtils authTestUtils;

    @BeforeAll
    public static void info() {
        System.out.println("Seed " + seed);
    }

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Test
    void user_can_register_and_use_access_token() {
        utils.assertProtectedResourceUnauthorized(null);

        var res = utils.registerUser(userUtils.createRandomUserWithStrongPassword());
        var tokens = utils.assertNotNullTokens(res);

        utils.assertProtectedResourceOk(tokens.getAccessToken());
    }

    @ParameterizedTest
    @CsvSource({
            "username",
            "user-name",
            "user.name",
            "user_name",
            "User123",
            "john_doe",
            "john-doe",
            "john.doe",
            "user123"
    })
    void registration_with_valid_username_should_return_201(String validUsername) {
        var user = userUtils.userBuilder().username(validUsername).build();
        var res = utils.registerUser(user);
        Assertions.assertEquals(HttpStatus.CREATED.value(), res.getStatusCode().value());
    }

    @ParameterizedTest
    @CsvSource({
            "user@example.com",
            "valid.email@example.com",
            "user_name@example.com",
            "user-name@example.org",
            "user+tag@example.net",
            "user123@example.co",
            "firstname.lastname@example.com",
            "user@my.example.com",
            "123test@example.com"
    })
    void registration_with_valid_email_should_return_201(String validEmail) {
        var user = userUtils.userBuilder().email(validEmail).build();
        var res = utils.registerUser(user);
        Assertions.assertEquals(HttpStatus.CREATED.value(), res.getStatusCode().value());
    }

    @Test
    void user_can_login_with_username_or_email_case_insensitive() {
        utils.assertProtectedResourceUnauthorized(null);

        var user = userUtils.createRandomUserWithStrongPassword();
        utils.registerUser(user);
        var resByEmail = utils.loginUser(user.email().toUpperCase(), user.password());
        var tokensByEmail = utils.assertNotNullTokens(resByEmail);
        utils.assertProtectedResourceOk(tokensByEmail.getAccessToken());

        var resByUsername = utils.loginUser(user.username().toUpperCase(), user.password());
        var tokensByUsername = utils.assertNotNullTokens(resByUsername);
        utils.assertProtectedResourceOk(tokensByUsername.getAccessToken());
    }

    @Test
    void refreshing_token_should_return_valid_new_tokens() {
        utils.assertProtectedResourceUnauthorized(null);
        var res = utils.registerUser(userUtils.createRandomUserWithStrongPassword());
        var tokens = utils.assertNotNullTokens(res);

        var resRefresh = utils.refreshToken(tokens.getRefreshToken());
        var newTokens = utils.assertNotNullTokens(resRefresh);

        utils.assertProtectedResourceOk(newTokens.getAccessToken());
    }

    @Test
    void logging_out_should_invalidate_the_access_token() {
        utils.assertProtectedResourceUnauthorized(null);

        var user = userUtils.createRandomUserWithStrongPassword();
        utils.registerUser(user);
        var res = utils.loginUser(user.email(), user.password());
        var tokens = utils.assertNotNullTokens(res);
        utils.assertProtectedResourceOk(tokens.getAccessToken());

        utils.logoutUser(tokens.getAccessToken());
        utils.assertProtectedResourceUnauthorized(tokens.getAccessToken());
    }

    @Test
    void logging_out_should_invalidate_the_refresh_token() {
        utils.assertProtectedResourceUnauthorized(null);

        var user = userUtils.createRandomUserWithStrongPassword();
        utils.registerUser(user);
        var res = utils.loginUser(user.email(), user.password());
        var tokens = utils.assertNotNullTokens(res);
        utils.assertProtectedResourceOk(tokens.getAccessToken());

        utils.logoutUser(tokens.getAccessToken());
        utils.assertRefreshTokenInvalid(tokens.getRefreshToken());
    }

    @Test
    void logging_out_should_invalidate_the_current_session_only() {
        // Register and login user1
        var user1 = userUtils.createRandomUserWithStrongPassword();
        var res1 = utils.registerUser(user1);
        var tokens1 = utils.assertNotNullTokens(res1);

        // Login user1 on another device
        var res1b = utils.loginUser(user1.email(), user1.password());
        var tokens1b = utils.assertNotNullTokens(res1b);

        // Register and login user2 (different user)
        var res2 = utils.registerUser(userUtils.createRandomUserWithStrongPassword());
        var tokens2 = utils.assertNotNullTokens(res2);

        // Logout user1 on session 1
        utils.logoutUser(tokens1.getAccessToken());

        // Assert user1's second session is still valid
        // We need to check the valid session before the invalid,
        // because trying to reuse a token invalidate the complete user's tokens.
        utils.assertProtectedResourceOk(tokens1b.getAccessToken());
        var refreshTokens1b = utils.refreshToken(tokens1b.getRefreshToken());
        var newTokens1b = utils.assertNotNullTokens(refreshTokens1b);
        utils.assertProtectedResourceOk(newTokens1b.getAccessToken());

        // Assert user1's tokens on session 1 are invalid
        utils.assertProtectedResourceUnauthorized(tokens1.getAccessToken());
        utils.assertRefreshTokenInvalid(tokens1.getRefreshToken());

        // Assert user2's tokens are still valid
        utils.assertProtectedResourceOk(tokens2.getAccessToken());
    }

    @Test
    void reusing_a_refresh_token_should_invalidate_all_user_sessions() {
        var user = userUtils.createRandomUserWithStrongPassword();
        var res = utils.registerUser(user);
        var tokens = utils.assertNotNullTokens(res);

        // Log in again to create a new "session" (stateless because of JWT)
        var res2 = utils.loginUser(user.email(), user.password());
        var tokens2 = utils.assertNotNullTokens(res2);
        utils.assertProtectedResourceOk(tokens2.getAccessToken());

        // First refresh - should be successful
        var resRefresh1 = utils.refreshToken(tokens.getRefreshToken());
        var tokens1 = utils.assertNotNullTokens(resRefresh1);
        utils.assertProtectedResourceOk(tokens1.getAccessToken());

        // Second refresh - should invalidate all sessions including the current one
        utils.assertRefreshTokenInvalid(tokens.getRefreshToken()); // Reuse original refresh token

        // tokens1 should now be invalid
        utils.assertRefreshTokenInvalid(tokens1.getRefreshToken());
        utils.assertProtectedResourceUnauthorized(tokens1.getAccessToken());
    }

    @Test
    void old_access_token_should_be_invalidated_when_refreshing_and_detect_reusing_old_access_token() {
        var user = userUtils.createRandomUserWithStrongPassword();
        var res = utils.registerUser(user);
        var tokens = utils.assertNotNullTokens(res);
        utils.assertProtectedResourceOk(tokens.getAccessToken());

        // Log in again to create a new "session" (stateless because of JWT)
        var res2 = utils.loginUser(user.email(), user.password());
        var tokens2 = utils.assertNotNullTokens(res2);
        utils.assertProtectedResourceOk(tokens2.getAccessToken());

        var resRefresh = utils.refreshToken(tokens.getRefreshToken());
        var newTokens = utils.assertNotNullTokens(resRefresh);
        utils.assertProtectedResourceOk(newTokens.getAccessToken());

        utils.assertProtectedResourceUnauthorized(tokens.getAccessToken()); // Old access token invalid
        utils.assertProtectedResourceUnauthorized(tokens2.getAccessToken()); // other user's sessions are invalid too
    }

    @Test
    void old_refresh_token_should_be_invalidated_when_refreshing_and_detect_reusing_old_refresh_token() {
        var user = userUtils.createRandomUserWithStrongPassword();
        var res = utils.registerUser(user);
        var tokens = utils.assertNotNullTokens(res);
        utils.assertProtectedResourceOk(tokens.getAccessToken());

        // Log in again to create a new "session" (stateless because of JWT)
        var res2 = utils.loginUser(user.email(), user.password());
        var tokens2 = utils.assertNotNullTokens(res2);
        utils.assertProtectedResourceOk(tokens2.getAccessToken());

        var resRefresh = utils.refreshToken(tokens.getRefreshToken());
        var newTokens = utils.assertNotNullTokens(resRefresh);
        utils.assertProtectedResourceOk(newTokens.getAccessToken());

        utils.assertRefreshTokenInvalid(tokens.getRefreshToken()); // Old refresh token invalid
        utils.assertRefreshTokenInvalid(tokens2.getRefreshToken()); // other user's sessions are invalid too
    }

    @Test
    void using_access_token_to_refresh_should_return_403() {
        var res = utils.registerUser(userUtils.createRandomUserWithStrongPassword());
        var tokens = utils.assertNotNullTokens(res);

        var refreshResponse = utils.refreshToken(tokens.getAccessToken()); // Use access token instead of refresh token
        Assertions.assertEquals(HttpStatus.FORBIDDEN.value(), refreshResponse.getStatusCode().value());
    }

    @Test
    void using_refresh_token_to_access_protected_routes_should_return_403() {
        var res = utils.registerUser(userUtils.createRandomUserWithStrongPassword());
        var tokens = utils.assertNotNullTokens(res);

        utils.assertProtectedResource(tokens.getRefreshToken(), HttpStatus.FORBIDDEN); // Use refresh token for protected resource
    }

    @ParameterizedTest
    @CsvSource({
            "invalid",
            "user@.com",
            "@example.com",
            "user@example",
            "user@@example.com",
            "user@com",
            "user@domain..com"
    })
    void registration_with_invalid_email_format_should_return_400(String invalidEmail) {
        var user = userUtils.userBuilder().email(invalidEmail).build();
        var res = utils.registerUser(user);
        Assertions.assertEquals(HttpStatus.BAD_REQUEST.value(), res.getStatusCode().value());
    }

    @ParameterizedTest
    @CsvSource({
            "user@name",
            "user name",
            "user!name",
            "user#name",
            "_username",
            "-username",
            "username-",
            "username_",
            "user__name",
            "user..name",
            "to",
            "valid-but-too-long"
    })
    void registration_with_invalid_username_should_return_400(String invalidUsername) {
        var user = userUtils.userBuilder().username(invalidUsername).build();
        var res = utils.registerUser(user);
        Assertions.assertEquals(HttpStatus.BAD_REQUEST.value(), res.getStatusCode().value());
    }

    @Test
    void registration_with_existing_username_should_return_409() {
        var user = userUtils.createRandomUserWithStrongPassword();
        utils.registerUser(user);
        // Same username
        var user2 = userUtils.userBuilder().username(user.username()).build();
        var res = utils.registerUser(user2);
        Assertions.assertEquals(HttpStatus.CONFLICT.value(), res.getStatusCode().value());
    }

    @Test
    void registration_with_existing_email_should_return_409() {
        var user = userUtils.createRandomUserWithStrongPassword();
        utils.registerUser(user);
        // Same email
        var user2 = userUtils.userBuilder().email(user.email()).build();
        var res = utils.registerUser(user2);
        Assertions.assertEquals(HttpStatus.CONFLICT.value(), res.getStatusCode().value());
    }

    @ParameterizedTest
    @CsvSource({
            "short",
            "nocapital1!",
            "NoSpecial123",
            "NoDigits!@#",
            "AllValidButTooLong012345678901234567890"
    })
    void registration_with_invalid_password_should_return_400(String invalidPassword) {
        var user = userUtils.userBuilder().password(invalidPassword).build();
        var res = utils.registerUser(user);
        Assertions.assertEquals(HttpStatus.BAD_REQUEST.value(), res.getStatusCode().value());
    }

    @ParameterizedTest
    @CsvSource({
            "EMPTY",
            "SPACE",
            "NULL"
    })
    void registration_with_null_or_empty_fields_should_return_400(String operation) {
        var randomUser = userUtils.createRandomUserWithStrongPassword();

        var value = switch (operation) {
            case "EMPTY" -> "";
            case "SPACE" -> " ";
            default -> null;
        };

        var fields = Arrays.asList("email", "username", "password");

        for (var field : fields) {
            var user = switch (field) {
                case "email" -> new UserRegistrationDTO(value, randomUser.username(), randomUser.password());
                case "username" -> new UserRegistrationDTO(randomUser.email(), value, randomUser.password());
                default -> new UserRegistrationDTO(randomUser.email(), randomUser.username(), value);
            };

            var res = utils.registerUser(user);
            Assertions.assertEquals(HttpStatus.BAD_REQUEST.value(), res.getStatusCode().value());
        }
    }

    @ParameterizedTest
    @CsvSource({
            "INVALID_EMAIL",
            "INVALID_USERNAME",
            "INVALID_PASSWORD"
    })
    void login_with_invalid_credentials_should_return_401(String operation) {
        var user = userUtils.createRandomUserWithStrongPassword();
        authTestUtils.registerUser(user);

        var identifier = user.username();
        var password = user.password();

        switch (operation) {
            case "INVALID_EMAIL":
                identifier = "doesnotexist@test.ch";
                break;
            case "INVALID_USERNAME":
                identifier = "doesnotexist";
                break;
            case "INVALID_PASSWORD":
            default:
                password = "Strong1P@asswordInvalid";
                break;
        }

        var res = utils.loginUser(identifier, password);
        Assertions.assertEquals(HttpStatus.UNAUTHORIZED.value(), res.getStatusCode().value());
    }
}
