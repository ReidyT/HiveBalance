package ch.reidyt.hivebalance.wallet.controllers;

import ch.reidyt.hivebalance.security.services.AuthenticationService;
import ch.reidyt.hivebalance.wallet.dtos.CreateWalletDTO;
import ch.reidyt.hivebalance.wallet.dtos.DeleteWalletDTO;
import ch.reidyt.hivebalance.wallet.dtos.GrantedWalletDTO;
import ch.reidyt.hivebalance.wallet.dtos.UpdateWalletDTO;
import ch.reidyt.hivebalance.wallet.errors.WalletNotFoundException;
import ch.reidyt.hivebalance.wallet.models.Wallet;
import ch.reidyt.hivebalance.wallet.services.WalletService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/wallets")
public class WalletController {
    private final AuthenticationService authenticationService;

    private final WalletService walletService;

    @PostMapping
    public ResponseEntity<Wallet> createWallet(
            @Valid @RequestBody CreateWalletDTO createWalletDTO,
            Authentication authentication
    ) {
        var userId = authenticationService.getAuthenticatedUserId(authentication);
        var wallet = walletService.addWallet(userId, createWalletDTO);

        return ResponseEntity.status(HttpStatus.CREATED).body(wallet);
    }

    @GetMapping
    public ResponseEntity<List<GrantedWalletDTO>> getAllWalletsOfCurrentUser(Authentication authentication) {
        var userId = authenticationService.getAuthenticatedUserId(authentication);
        var grantedUserWallets = walletService.getAllGrantedUserWallets(userId);

        return ResponseEntity.status(HttpStatus.OK).body(grantedUserWallets);
    }

    @GetMapping("/{walletId}")
    public ResponseEntity<Wallet> getWalletById(@PathVariable UUID walletId, Authentication authentication) {
        var userId = authenticationService.getAuthenticatedUserId(authentication);
        var wallet = walletService.getWalletById(userId, walletId)
                .orElseThrow(() -> new WalletNotFoundException(walletId));

        return ResponseEntity.status(HttpStatus.OK).body(wallet);
    }

    @PatchMapping("/{walletId}")
    public ResponseEntity<Wallet> updateWalletById(
            @PathVariable UUID walletId,
            @Valid @RequestBody UpdateWalletDTO updateWalletDTO,
            Authentication authentication) {
        var userId = authenticationService.getAuthenticatedUserId(authentication);
        var wallet = walletService.updateWalletById(userId, walletId, updateWalletDTO);

        return ResponseEntity.status(HttpStatus.OK).body(wallet);
    }

    @DeleteMapping("/{walletId}")
    public ResponseEntity<DeleteWalletDTO> deleteWalletById(@PathVariable UUID walletId, Authentication authentication) {
        var userId = authenticationService.getAuthenticatedUserId(authentication);
        walletService.deleteWalletById(userId, walletId);

        return ResponseEntity.status(HttpStatus.OK).body(new DeleteWalletDTO(walletId));
    }
}
