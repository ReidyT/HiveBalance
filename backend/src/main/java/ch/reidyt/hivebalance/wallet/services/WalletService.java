package ch.reidyt.hivebalance.wallet.services;

import ch.reidyt.hivebalance.wallet.dtos.CreateWalletDTO;
import ch.reidyt.hivebalance.wallet.models.Wallet;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

public interface WalletService {
    @Transactional
    Wallet addWallet(UUID currentUserId, CreateWalletDTO createWalletDTO);
}
