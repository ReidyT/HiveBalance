package ch.reidyt.hivebalance.wallet.controllers;

import ch.reidyt.hivebalance.base.config.TestDatabaseConfig;
import ch.reidyt.hivebalance.permission.enums.WalletPermission;
import ch.reidyt.hivebalance.permission.models.Permission;
import ch.reidyt.hivebalance.permission.repositories.PermissionRepository;
import ch.reidyt.hivebalance.security.services.JwtTokenConverter;
import ch.reidyt.hivebalance.utils.AuthTestUtils;
import ch.reidyt.hivebalance.utils.HttpException;
import ch.reidyt.hivebalance.utils.MockUserUtils;
import ch.reidyt.hivebalance.utils.WalletTestUtils;
import ch.reidyt.hivebalance.wallet.dtos.CreateWalletDTO;
import ch.reidyt.hivebalance.wallet.dtos.DeleteWalletDTO;
import ch.reidyt.hivebalance.wallet.dtos.GrantedWalletDTO;
import ch.reidyt.hivebalance.wallet.dtos.UpdateWalletDTO;
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
import java.util.Objects;
import java.util.Random;
import java.util.UUID;

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
    @Autowired
    PermissionRepository permissionRepository;
    @Autowired
    JwtTokenConverter jwtTokenConverter;

    @BeforeAll
    public static void info() {
        System.out.println("Seed " + seed);
    }

    private String registerAndGetAccessToken() {
        var res = authTestUtils.registerUser(mockUserUtils.createRandomUserWithStrongPassword());
        return authTestUtils.assertNotNullTokens(res).getAccessToken();
    }

    private UUID extractUserId(String accessToken) {
        return jwtTokenConverter
                .decode(accessToken)
                .orElseThrow(() -> new IllegalStateException("Invalid token."))
                .getUserId();
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
        var res = utils.getUserGrantedWallets(u1).stream()
                .map(GrantedWalletDTO::name)
                .sorted()
                .toList();
        var expectedU1 = Arrays.stream(wallets_u1)
                .map(CreateWalletDTO::name)
                .sorted()
                .toList();
        var expectedU2 = Arrays.stream(wallets_u2)
                .map(CreateWalletDTO::name)
                .sorted()
                .toList();
        Assertions.assertEquals(expectedU1, res);
        Assertions.assertNotEquals(expectedU2, res);
    }

    @Test
    void get_wallet_by_id_if_granted() {
        // Create the wallets for U1
        var u1 = registerAndGetAccessToken();
        var resCreate = utils.createWallet(new CreateWalletDTO("U1 W1", "CHF"), u1);
        Assertions.assertEquals(HttpStatus.CREATED, resCreate.getStatusCode());

        // Retrieve the wallet by id
        var res = utils.getWalletById(u1, Objects.requireNonNull(resCreate.getBody()).getId().toString());
        Assertions.assertEquals(resCreate.getBody().getId(), res.getId());
        Assertions.assertEquals(resCreate.getBody().getName(), res.getName());
    }

    @Test
    void get_wallet_without_permission_should_return_not_found() {
        // Create the wallets for U1
        var u1 = registerAndGetAccessToken();
        var resCreate = utils.createWallet(new CreateWalletDTO("U1 W1", "CHF"), u1);
        Assertions.assertEquals(HttpStatus.CREATED, resCreate.getStatusCode());
        var walletId = Objects.requireNonNull(resCreate.getBody()).getId().toString();

        // Try to access with user 2
        var ex = Assertions.assertThrows(
                HttpException.class,
                () -> utils.getWalletById(registerAndGetAccessToken(), walletId)
        );
        Assertions.assertEquals(HttpStatus.NOT_FOUND.value(), ex.httpStatusCode.value());
    }

    @Test
    void get_wallet_non_existing_wallet_id_should_return_not_found() {
        // Try to access to a non-exist wallet
        var ex = Assertions.assertThrows(
                HttpException.class,
                () -> utils.getWalletById(registerAndGetAccessToken(), UUID.randomUUID().toString())
        );
        Assertions.assertEquals(HttpStatus.NOT_FOUND.value(), ex.httpStatusCode.value());
    }

    @Test
    void get_wallet_with_invalid_uuid_should_return_bad_request() {
        var ex = Assertions.assertThrows(
                HttpException.class,
                () -> utils.getWalletById(registerAndGetAccessToken(), "INVALID-UUID")
        );
        Assertions.assertEquals(HttpStatus.BAD_REQUEST.value(), ex.httpStatusCode.value());
    }

    @Test
    void delete_wallet_by_id_should_return_removed_id() {
        // Create the wallet.
        var accessToken = registerAndGetAccessToken();
        var createRes = utils.createWallet(new CreateWalletDTO("Wallet to delete", "CHF"), accessToken);
        Assertions.assertEquals(HttpStatus.CREATED, createRes.getStatusCode());
        var walletId = Objects.requireNonNull(createRes.getBody()).getId();

        // Give access to the wallet to another user.
        permissionRepository.save(permissionRepository.save(Permission.builder()
                .id(new Permission.Id(extractUserId(registerAndGetAccessToken()), walletId))
                .permission(WalletPermission.EDITOR)
                .build()));

        // Two permissions should exist for this wallet.
        Assertions.assertEquals(2, permissionRepository.getAllByWalletId(walletId).size());

        // Deleting the wallet should remove it correctly.
        var deleteRes = utils.deleteWalletById(accessToken, walletId.toString());
        Assertions.assertEquals(new DeleteWalletDTO(walletId), deleteRes);

        var ex = Assertions.assertThrows(
                HttpException.class,
                () -> utils.getWalletById(accessToken, walletId.toString())
        );
        Assertions.assertEquals(HttpStatus.NOT_FOUND.value(), ex.httpStatusCode.value());

        // All permissions should have been deleted too.
        Assertions.assertEquals(0, permissionRepository.getAllByWalletId(walletId).size());
    }

    @Test
    void delete_wallet_by_id_with_guest_should_return_unauthorized() {
        var accessToken = registerAndGetAccessToken();
        var createRes = utils.createWallet(new CreateWalletDTO("Wallet to delete", "CHF"), accessToken);
        Assertions.assertEquals(HttpStatus.CREATED, createRes.getStatusCode());
        var walletId = Objects.requireNonNull(createRes.getBody()).getId();

        // Trying to delete without being logged should return unauthorized.
        var ex = Assertions.assertThrows(
                HttpException.class,
                () -> utils.deleteWalletById(null, walletId.toString())
        );
        Assertions.assertEquals(HttpStatus.UNAUTHORIZED.value(), ex.httpStatusCode.value());

        // The wallet should still exist, as well as the permission
        Assertions.assertEquals(walletId, utils.getWalletById(accessToken, walletId.toString()).getId());
        Assertions.assertEquals(1, permissionRepository.getAllByWalletId(walletId).size());
    }

    @Test
    void delete_wallet_by_id_without_owner_permission_should_return_not_found() {
        var accessToken = registerAndGetAccessToken();
        var createRes = utils.createWallet(new CreateWalletDTO("Wallet to delete", "CHF"), accessToken);
        Assertions.assertEquals(HttpStatus.CREATED, createRes.getStatusCode());
        var walletId = Objects.requireNonNull(createRes.getBody()).getId();

        // Trying to delete with another user without permission should return not found.
        var user = registerAndGetAccessToken();
        var userId = extractUserId(user);
        var ex = Assertions.assertThrows(
                HttpException.class,
                () -> utils.deleteWalletById(user, walletId.toString())
        );
        Assertions.assertEquals(HttpStatus.NOT_FOUND.value(), ex.httpStatusCode.value());

        // Add admin permission to the new user
        permissionRepository.save(Permission.builder()
                .id(new Permission.Id(userId, walletId))
                .permission(WalletPermission.ADMIN)
                .build());

        // Trying to remove with an admin user should return not found. Only owners can remove the wallet!
        var ex2 = Assertions.assertThrows(
                HttpException.class,
                () -> utils.deleteWalletById(user, walletId.toString())
        );
        Assertions.assertEquals(HttpStatus.NOT_FOUND.value(), ex2.httpStatusCode.value());

        // The wallet should still exist, as well as the permission
        Assertions.assertEquals(walletId, utils.getWalletById(accessToken, walletId.toString()).getId());
        Assertions.assertEquals(2, permissionRepository.getAllByWalletId(walletId).size());
    }

    @Test
    void delete_wallet_by_id_should_return_not_found_if_not_exist() {
        var accessToken = registerAndGetAccessToken();
        var ex = Assertions.assertThrows(
                HttpException.class,
                () -> utils.deleteWalletById(accessToken, UUID.randomUUID().toString())
        );
        Assertions.assertEquals(HttpStatus.NOT_FOUND.value(), ex.httpStatusCode.value());
    }

    @Test
    void delete_wallet_by_id_should_return_bad_request_if_invalid_uuid() {
        var accessToken = registerAndGetAccessToken();
        var ex = Assertions.assertThrows(
                HttpException.class,
                () -> utils.deleteWalletById(accessToken, "Invalid-uuid")
        );
        Assertions.assertEquals(HttpStatus.BAD_REQUEST.value(), ex.httpStatusCode.value());
    }

    @Test
    void patch_wallet_by_id_should_return_updated_wallet() {
        // Create the wallet.
        var accessToken = registerAndGetAccessToken();
        var createRes = utils.createWallet(new CreateWalletDTO("My New Wallet", "CHF"), accessToken);
        Assertions.assertEquals(HttpStatus.CREATED, createRes.getStatusCode());
        var walletId = Objects.requireNonNull(createRes.getBody()).getId();

        // Update the name and currency
        var fullUpdatedWallet = new UpdateWalletDTO("Updated Wallet", "EUR");
        var fullUpdated = utils.patchWalletById(accessToken, walletId.toString(), fullUpdatedWallet);
        Assertions.assertEquals(fullUpdatedWallet.name(), fullUpdated.getName());
        Assertions.assertEquals(fullUpdatedWallet.currencyCode(), fullUpdated.getCurrency().getCode());
        Assertions.assertEquals(walletId, fullUpdated.getId());

        // Update the name only
        var newName = "Just the name";
        var nameUpdatedWallet = utils.patchWalletById(accessToken, walletId.toString(), new UpdateWalletDTO(newName, null));
        Assertions.assertEquals(newName, nameUpdatedWallet.getName());
        Assertions.assertEquals(fullUpdatedWallet.currencyCode(), nameUpdatedWallet.getCurrency().getCode());
        Assertions.assertEquals(walletId, nameUpdatedWallet.getId());

        // Update the currency only
        var newCurrency = "USD";
        var currencyUpdatedWallet = utils.patchWalletById(accessToken, walletId.toString(), new UpdateWalletDTO(null, newCurrency));
        Assertions.assertEquals(newName, currencyUpdatedWallet.getName());
        Assertions.assertEquals(newCurrency, currencyUpdatedWallet.getCurrency().getCode());
        Assertions.assertEquals(walletId, currencyUpdatedWallet.getId());
    }

    @Test
    void patch_wallet_by_id_with_guest_should_return_unauthorized() {
        var accessToken = registerAndGetAccessToken();
        var createRes = utils.createWallet(new CreateWalletDTO("Wallet to delete", "CHF"), accessToken);
        Assertions.assertEquals(HttpStatus.CREATED, createRes.getStatusCode());
        var wallet = Objects.requireNonNull(createRes.getBody());
        var walletId = wallet.getId();

        // Trying to delete without being logged should return unauthorized.
        var ex = Assertions.assertThrows(
                HttpException.class,
                () -> utils.patchWalletById(null, walletId.toString(), new UpdateWalletDTO("Test", "CHF"))
        );
        Assertions.assertEquals(HttpStatus.UNAUTHORIZED.value(), ex.httpStatusCode.value());

        // The wallet should not have been updated
        var getWallet = utils.getWalletById(accessToken, walletId.toString());
        Assertions.assertEquals(wallet.getName(), getWallet.getName());
        Assertions.assertEquals(wallet.getCurrency(), getWallet.getCurrency());
    }

    @Test
    void patch_wallet_by_id_without_owner_permission_should_return_not_found() {
        var accessToken = registerAndGetAccessToken();
        var createRes = utils.createWallet(new CreateWalletDTO("Wallet to delete", "CHF"), accessToken);
        Assertions.assertEquals(HttpStatus.CREATED, createRes.getStatusCode());
        var wallet = Objects.requireNonNull(createRes.getBody());
        var walletId = wallet.getId();

        // Trying to delete with another user without permission should return not found.
        var user = registerAndGetAccessToken();
        var userId = extractUserId(user);
        var ex = Assertions.assertThrows(
                HttpException.class,
                () -> utils.deleteWalletById(user, walletId.toString())
        );
        Assertions.assertEquals(HttpStatus.NOT_FOUND.value(), ex.httpStatusCode.value());

        // Add admin permission to the new user
        permissionRepository.save(Permission.builder()
                .id(new Permission.Id(userId, walletId))
                .permission(WalletPermission.ADMIN)
                .build());

        // Trying to remove with an admin user should return not found. Only owners can remove the wallet!
        var ex2 = Assertions.assertThrows(
                HttpException.class,
                () -> utils.deleteWalletById(user, walletId.toString())
        );
        Assertions.assertEquals(HttpStatus.NOT_FOUND.value(), ex2.httpStatusCode.value());

        // The wallet should not have been updated
        var getWallet = utils.getWalletById(accessToken, walletId.toString());
        Assertions.assertEquals(wallet.getName(), getWallet.getName());
        Assertions.assertEquals(wallet.getCurrency(), getWallet.getCurrency());
    }

    @Test
    void patch_wallet_by_id_should_return_not_found_if_not_exist() {
        var accessToken = registerAndGetAccessToken();
        var ex = Assertions.assertThrows(
                HttpException.class,
                () -> utils.patchWalletById(accessToken, UUID.randomUUID().toString(), new UpdateWalletDTO("Test", "CHF"))
        );
        Assertions.assertEquals(HttpStatus.NOT_FOUND.value(), ex.httpStatusCode.value());
    }

    @Test
    void patch_wallet_by_id_should_return_bad_request_if_invalid_uuid() {
        var accessToken = registerAndGetAccessToken();
        var ex = Assertions.assertThrows(
                HttpException.class,
                () -> utils.patchWalletById(accessToken, "Invalid-uuid", new UpdateWalletDTO("Test", "CHF"))
        );
        Assertions.assertEquals(HttpStatus.BAD_REQUEST.value(), ex.httpStatusCode.value());
    }
}
