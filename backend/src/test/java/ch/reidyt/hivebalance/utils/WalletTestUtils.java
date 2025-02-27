package ch.reidyt.hivebalance.utils;

import ch.reidyt.hivebalance.wallet.dtos.CreateWalletDTO;
import ch.reidyt.hivebalance.wallet.models.Wallet;
import org.junit.jupiter.api.Assertions;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

@Component
public class WalletTestUtils extends HttpTestUtils {

    private static final String CREATE_WALLET_ROUTE = "/wallets";

    public WalletTestUtils(TestRestTemplate restTemplate) {
        super(restTemplate);
    }

    public ResponseEntity<Wallet> createWallet(CreateWalletDTO walletDTO, String accessToken) {
        return restTemplate.postForEntity(CREATE_WALLET_ROUTE, httpEntityFactory(accessToken, walletDTO), Wallet.class);
    }

    public void assertWalletEquals(CreateWalletDTO createWalletDTO, ResponseEntity<Wallet> res) {
        Assertions.assertNotNull(res.getBody());
        Assertions.assertEquals(createWalletDTO.name(), res.getBody().getName());
        Assertions.assertEquals(createWalletDTO.currencyCode(), res.getBody().getCurrency().getCode());
    }
}
