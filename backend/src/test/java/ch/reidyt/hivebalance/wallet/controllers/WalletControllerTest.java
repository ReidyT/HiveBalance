package ch.reidyt.hivebalance.wallet.controllers;

import ch.reidyt.hivebalance.base.controllers.TestController;
import ch.reidyt.hivebalance.utils.AuthTestUtils;
import ch.reidyt.hivebalance.utils.MockUserUtils;
import ch.reidyt.hivebalance.utils.WalletTestUtils;
import ch.reidyt.hivebalance.wallet.dtos.CreateWalletDTO;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;

import java.util.Random;

class WalletControllerTest extends TestController {
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
            "Wallet.Name",
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
            "123InvalidWallet",
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
}
