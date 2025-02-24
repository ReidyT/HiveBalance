package ch.reidyt.hivebalance.wallet.controllers;

import ch.reidyt.hivebalance.security.services.AuthenticationService;
import ch.reidyt.hivebalance.wallet.dtos.CreateWalletDTO;
import ch.reidyt.hivebalance.wallet.models.Wallet;
import ch.reidyt.hivebalance.wallet.services.WalletService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
        var beeUser = authenticationService.getAuthenticatedUser(authentication);
        var wallet = walletService.addWallet(beeUser, createWalletDTO);

        return ResponseEntity.status(HttpStatus.CREATED).body(wallet);
    }
}
