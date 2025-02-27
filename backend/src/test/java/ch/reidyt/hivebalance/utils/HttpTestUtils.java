package ch.reidyt.hivebalance.utils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.RequiredArgsConstructor;
import org.junit.Assert;
import org.junit.jupiter.api.Assertions;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;

/**
 * Utility class for testing HTTP flows.
 */
@RequiredArgsConstructor
public abstract class HttpTestUtils {
    protected final TestRestTemplate restTemplate;

    /**
     * Creates an HttpEntity with an optional Bearer token in the header.
     *
     * @param token The Bearer token to include in the header, or null if no token should be included.
     * @return The created HttpEntity.
     */
    public static <T> HttpEntity<T> httpEntityFactory(String token, T body) {
        var headers = new HttpHeaders();
        if (token != null) {
            headers.setBearerAuth(token);
        }
        return new HttpEntity<>(body, headers);
    }

    /**
     * Creates an HttpEntity with an optional Bearer token in the header.
     *
     * @param token The Bearer token to include in the header, or null if no token should be included.
     * @return The created HttpEntity.
     */
    public static HttpEntity<String> httpEntityFactory(String token) {
        return httpEntityFactory(token, null);
    }

    public static <T> T exchange(
            TestRestTemplate restTemplate,
            String route,
            HttpMethod httpMethod,
            String accessToken,
            TypeReference<T> responseType
    ) {
        var res = restTemplate.exchange(
                route,
                httpMethod,
                httpEntityFactory(accessToken),
                String.class
        );

        if (res.getStatusCode() == HttpStatus.OK) {
            try {
                return new ObjectMapper().registerModule(new JavaTimeModule()).readValue(res.getBody(), responseType);
            } catch (JsonProcessingException e) {
                Assert.fail(e.getMessage());
            }
        }

        throw new HttpException(res.getStatusCode());
    }

    /**
     * Asserts that accessing a protected resource with the given token results in the expected HTTP status.
     *
     * @param route          The route to check.
     * @param token          The token to use for accessing the protected resource.
     * @param expectedStatus The expected HTTP status code.
     */
    public void assertProtectedResource(String route, String token, HttpStatus expectedStatus) {
        var requestEntity = httpEntityFactory(token);
        var response = restTemplate.exchange(route, HttpMethod.GET, requestEntity, String.class);
        Assertions.assertEquals(expectedStatus.value(), response.getStatusCode().value());
    }

    /**
     * Asserts that accessing a protected resource with the given token (or no token) results in a 401 Unauthorized status.
     *
     * @param route The route to check.
     * @param token The token used to try to access to the route. Can be null or invalid.
     */
    public void assertProtectedResourceUnauthorized(String route, String token) {
        assertProtectedResource(route, token, HttpStatus.UNAUTHORIZED);
    }

    /**
     * Asserts that accessing a protected resource with the given access token results in a 200 OK status.
     *
     * @param route       The route to check.
     * @param accessToken The valid access token.
     */
    public void assertProtectedResourceOk(String route, String accessToken) {
        assertProtectedResource(route, accessToken, HttpStatus.OK);
    }
}
