package ch.reidyt.hivebalance.wallet.services;

import ch.reidyt.hivebalance.user.models.BeeUser;
import ch.reidyt.hivebalance.wallet.dtos.CreateWalletDTO;
import ch.reidyt.hivebalance.wallet.models.Wallet;
import org.springframework.transaction.annotation.Transactional;

public interface WalletService {
    @Transactional
    Wallet addWallet(BeeUser currentUser, CreateWalletDTO createWalletDTO);
}
