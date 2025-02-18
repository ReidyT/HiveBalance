package ch.reidyt.hivebalance.security.controllers;

import ch.reidyt.hivebalance.config.errors.ErrorResponse;
import ch.reidyt.hivebalance.security.dtos.TokensDTO;
import ch.reidyt.hivebalance.security.dtos.UserRegistrationDTO;
import ch.reidyt.hivebalance.security.services.AuthenticationService;
import ch.reidyt.hivebalance.security.services.TokenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthenticationController {
    private final AuthenticationService authenticationService;

    private final TokenService tokenService;

    @PostMapping("/register")
    public ResponseEntity<TokensDTO> register(@Valid @RequestBody UserRegistrationDTO userRegistrationDTO) {
        var authentication = authenticationService.registerUser(userRegistrationDTO);
        // Parent id is null because the tokens are generated from the credentials and
        // not from the refresh token.
        var tokens = tokenService.generateTokenPair(authentication, null);

        return ResponseEntity.status(HttpStatus.CREATED).body(tokens);
    }

    @PostMapping("/login")
    public ResponseEntity<TokensDTO> login(Authentication authentication) {
        // Parent id is null because the tokens are generated from the credentials and
        // not from the refresh token.
        var tokens = tokenService.generateTokenPair(authentication, null);

        return ResponseEntity.status(HttpStatus.CREATED).body(tokens);
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<Object> refreshToken(@RequestHeader("Authorization") String authorization,
                                               Authentication authentication) {
        // Extract the refresh token
        var refreshToken = authorization.substring(7);

        if (!tokenService.isRefreshToken(refreshToken)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ErrorResponse(
                            "Authorization failed",
                            "The given token is not a valid refresh token.",
                            HttpStatus.FORBIDDEN
                    ));
        }

        // Generate a new token pair
        var newTokens = tokenService.generateTokenPair(authentication, refreshToken);

        return ResponseEntity.status(HttpStatus.CREATED).body(newTokens);
    }

    @PostMapping("/logout")
    public ResponseEntity<Object> logOut(@RequestHeader("Authorization") String authorization) {
        // Extract the access token
        var accessToken = authorization.substring(7);

        tokenService.userLogOut(accessToken);

        return ResponseEntity.status(HttpStatus.OK).build();
    }
}
