package ch.reidyt.hivebalance.wallet.services;

import ch.reidyt.hivebalance.permission.enums.WalletPermission;
import ch.reidyt.hivebalance.permission.models.Permission;
import ch.reidyt.hivebalance.permission.repositories.PermissionRepository;
import ch.reidyt.hivebalance.wallet.dtos.CreateWalletDTO;
import ch.reidyt.hivebalance.wallet.dtos.GrantedWalletDTO;
import ch.reidyt.hivebalance.wallet.errors.InvalidCurrencyException;
import ch.reidyt.hivebalance.wallet.errors.WalletNotFoundException;
import ch.reidyt.hivebalance.wallet.models.Wallet;
import ch.reidyt.hivebalance.wallet.repositories.CurrencyRepository;
import ch.reidyt.hivebalance.wallet.repositories.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WalletService {
    private final WalletRepository walletRepository;

    private final PermissionRepository permissionRepository;

    private final CurrencyRepository currencyRepository;

    @Transactional
    public Wallet addWallet(UUID currentUserId, CreateWalletDTO createWalletDTO) {
        var currency = currencyRepository.findById(createWalletDTO.currencyCode())
                .orElseThrow(() -> new InvalidCurrencyException(createWalletDTO.currencyCode()));

        var wallet = walletRepository.save(createWalletDTO.toWallet(currency));

        permissionRepository.save(Permission.builder()
                .id(new Permission.Id(currentUserId, wallet.getId()))
                .permission(WalletPermission.OWNER)
                .createdAt(Instant.now())
                .build());

        return wallet;
    }

    public List<GrantedWalletDTO> getAllGrantedUserWallets(UUID currentUserId) {
        return walletRepository.findAllGrantedWalletsByUserId(currentUserId);
    }

    public Optional<Wallet> getWalletById(UUID currentUserId, UUID walletId) {
        return walletRepository.findGrantedWalletById(currentUserId, walletId);
    }

    @Transactional
    public void deleteWalletById(UUID currentUserId, UUID walletId) throws WalletNotFoundException {
        // User must own the wallet to have the permission to delete it.
        var canDelete = permissionRepository.hasWalletPermission(currentUserId, walletId, WalletPermission.OWNER);

        // If the wallet doesn't exist or the user doesn't have the permission, throw not found.
        if (!canDelete) {
            throw new WalletNotFoundException(walletId);
        }

        // Remove all the permissions on this wallet to avoid foreign key violation constraint.
        // Ideally, the on delete cascade should be used here, but it doesn't seem to work here...
        permissionRepository.deleteAllByWalletId(walletId);

        // Then the wallet can be removed.
        walletRepository.deleteById(walletId);
    }
}
