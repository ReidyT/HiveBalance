package ch.reidyt.hivebalance.wallet.controllers;

import ch.reidyt.hivebalance.base.config.TestDatabaseConfig;
import ch.reidyt.hivebalance.utils.AuthTestUtils;
import ch.reidyt.hivebalance.utils.HttpException;
import ch.reidyt.hivebalance.utils.MockUserUtils;
import ch.reidyt.hivebalance.utils.WalletTestUtils;
import ch.reidyt.hivebalance.wallet.dtos.CreateWalletDTO;
import ch.reidyt.hivebalance.wallet.dtos.GrantedWalletDTO;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.http.HttpStatus;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.Arrays;
import java.util.Random;

@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class WalletControllerTest {
    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = TestDatabaseConfig.createPostgreSQLContainer();

    private static final int seed = new Random().nextInt();
    private static final MockUserUtils mockUserUtils = MockUserUtils.builder().seed(seed).build();
    @Autowired
    WalletTestUtils utils;
    @Autowired
    AuthTestUtils authTestUtils;

    @BeforeAll
    public static void info() {
        System.out.println("Seed " + seed);
    }

    private String registerAndGetAccessToken() {
        var res = authTestUtils.registerUser(mockUserUtils.createRandomUserWithStrongPassword());
        return authTestUtils.assertNotNullTokens(res).getAccessToken();
    }

    @ParameterizedTest
    @CsvSource({
            "My Wallet",                // English
            "My trip to Switzerland",
            "Wallet_Name",
            "Wallet-Name",
            "1Wallet.Name",
            "Wallet Name 123",
            "Ééàçüöï",                 // French and German
            "Portefeuille",              // French
            "Geldbeutel",                // German
            "Portefeuille Personnel", // French with space
            "Mein Geldbeutel",          // German with space
            "Café Wallet",              // mixed case and accented chars
            "Konto für Café"            //German accented characters and spaces
    })
    void create_wallet_with_valid_name_should_return_created(String validWalletName) {
        var wallet = new CreateWalletDTO(validWalletName, "CHF");
        var res = utils.createWallet(wallet, registerAndGetAccessToken());
        Assertions.assertEquals(HttpStatus.CREATED.value(), res.getStatusCode().value());
        utils.assertWalletEquals(wallet, res);
    }

    @ParameterizedTest
    @CsvSource({
            "USD",
            "EUR",
            "GBP",
            "CHF"
    })
    void create_wallet_with_valid_currency_should_return_created(String validCurrency) {
        var wallet = new CreateWalletDTO("Wallet", validCurrency);
        var res = utils.createWallet(wallet, registerAndGetAccessToken());
        Assertions.assertEquals(HttpStatus.CREATED.value(), res.getStatusCode().value());
        utils.assertWalletEquals(wallet, res);
    }

    @Test
    void create_wallet_requires_authentication() {
        var res = utils.createWallet(new CreateWalletDTO("Wallet", "CHF"), null);
        Assertions.assertEquals(HttpStatus.UNAUTHORIZED.value(), res.getStatusCode().value());
    }

    @ParameterizedTest
    @CsvSource({
            "Invalid! Wallet",
            "Invalid@Wallet",
            "InvalidWallet!",
            "' Invalid Wallet'",
            "'Invalid Wallet '",
            "Inv#lid Wallet"
    })
    void create_wallet_with_invalid_name_should_return_bad_request(String invalidWalletName) {
        var res = utils.createWallet(new CreateWalletDTO(invalidWalletName, "CHF"), registerAndGetAccessToken());
        Assertions.assertEquals(HttpStatus.BAD_REQUEST.value(), res.getStatusCode().value());
    }

    @ParameterizedTest
    @CsvSource({
            "Invalid",
            "TOOLONG",
            "1234",
            "€URO",
            "US$"
    })
    void create_wallet_with_invalid_currency_should_return_bad_request(String invalidCurrency) {
        var res = utils.createWallet(new CreateWalletDTO("Wallet", invalidCurrency), registerAndGetAccessToken());
        Assertions.assertEquals(HttpStatus.BAD_REQUEST.value(), res.getStatusCode().value());
    }

    @Test
    void create_wallet_with_empty_body_should_return_bad_request() {
        var res = utils.createWallet(null, registerAndGetAccessToken());
        Assertions.assertEquals(HttpStatus.BAD_REQUEST.value(), res.getStatusCode().value());
    }

    @Test
    void get_user_wallets_requires_authentication() {
        var ex = Assertions.assertThrows(HttpException.class, () -> utils.getUserGrantedWallets(null));
        Assertions.assertEquals(HttpStatus.UNAUTHORIZED.value(), ex.httpStatusCode.value());
    }

    @Test
    void get_user_wallets_of_current_user_only() {
        // Create the wallets for U1
        var u1 = registerAndGetAccessToken();
        CreateWalletDTO[] wallets_u1 = {
                new CreateWalletDTO("U1 W1", "CHF"),
                new CreateWalletDTO("U1 W2", "CHF"),
                new CreateWalletDTO("U1 W3", "CHF")
        };
        for (CreateWalletDTO w : wallets_u1) {
            utils.createWallet(w, u1);
        }

        // Do the same for U2
        var u2 = registerAndGetAccessToken();
        CreateWalletDTO[] wallets_u2 = {
                new CreateWalletDTO("U2 W1", "CHF"),
                new CreateWalletDTO("U2 W2", "CHF"),
                new CreateWalletDTO("U2 W3", "CHF")
        };
        for (CreateWalletDTO w : wallets_u2) {
            utils.createWallet(w, u2);
        }

        // Only the wallets of u1 should be returned
        var res = utils.getUserGrantedWallets(u1).stream().map(GrantedWalletDTO::name).toList();
        Assertions.assertEquals(res, Arrays.stream(wallets_u1).map(CreateWalletDTO::name).toList());
        Assertions.assertNotEquals(res, Arrays.stream(wallets_u2).map(CreateWalletDTO::name).toList());
    }
}
