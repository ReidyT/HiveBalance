package ch.reidyt.hivebalance.wallet.services;

import ch.reidyt.hivebalance.permission.enums.WalletPermission;
import ch.reidyt.hivebalance.permission.models.Permission;
import ch.reidyt.hivebalance.permission.repositories.PermissionRepository;
import ch.reidyt.hivebalance.user.models.BeeUser;
import ch.reidyt.hivebalance.wallet.dtos.CreateWalletDTO;
import ch.reidyt.hivebalance.wallet.errors.InvalidCurrencyException;
import ch.reidyt.hivebalance.wallet.models.Wallet;
import ch.reidyt.hivebalance.wallet.repositories.CurrencyRepository;
import ch.reidyt.hivebalance.wallet.repositories.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class WalletServiceImpl implements WalletService {
    private final WalletRepository walletRepository;

    private final PermissionRepository permissionRepository;

    private final CurrencyRepository currencyRepository;

    public Wallet addWallet(BeeUser currentUser, CreateWalletDTO createWalletDTO) {
        var currency = currencyRepository.findById(createWalletDTO.currencyCode())
                .orElseThrow(() -> new InvalidCurrencyException(createWalletDTO.currencyCode()));

        var wallet = walletRepository.save(createWalletDTO.toWallet(currency));

        permissionRepository.save(Permission.builder()
                .beeUser(currentUser)
                .wallet(wallet)
                .permission(WalletPermission.OWNER)
                .createdAt(Instant.now())
                .build());

        return wallet;
    }
}
