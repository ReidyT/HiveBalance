package ch.reidyt.hivebalance.utils;

import ch.reidyt.hivebalance.wallet.dtos.CreateWalletDTO;
import ch.reidyt.hivebalance.wallet.dtos.GrantedWalletDTO;
import ch.reidyt.hivebalance.wallet.models.Wallet;
import com.fasterxml.jackson.core.type.TypeReference;
import org.junit.jupiter.api.Assertions;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class WalletTestUtils extends HttpTestUtils {

    private static final String CREATE_WALLET_ROUTE = "/wallets";
    private static final String GET_USER_GRANTED_WALLETS_ROUTE = "/wallets";

    public WalletTestUtils(TestRestTemplate restTemplate) {
        super(restTemplate);
    }

    public ResponseEntity<Wallet> createWallet(CreateWalletDTO walletDTO, String accessToken) {
        return restTemplate.postForEntity(CREATE_WALLET_ROUTE, httpEntityFactory(accessToken, walletDTO), Wallet.class);
    }

    public List<GrantedWalletDTO> getUserGrantedWallets(String accessToken) {
        return exchange(
                restTemplate,
                GET_USER_GRANTED_WALLETS_ROUTE,
                HttpMethod.GET,
                accessToken,
                new TypeReference<>() {
                }
        );
    }

    public void assertWalletEquals(CreateWalletDTO createWalletDTO, ResponseEntity<Wallet> res) {
        Assertions.assertNotNull(res.getBody());
        Assertions.assertEquals(createWalletDTO.name(), res.getBody().getName());
        Assertions.assertEquals(createWalletDTO.currencyCode(), res.getBody().getCurrency().getCode());
    }
}
