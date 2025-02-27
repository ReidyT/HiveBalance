package ch.reidyt.hivebalance.security.services;

import ch.reidyt.hivebalance.security.dtos.UserRegistrationDTO;
import org.springframework.security.authentication.InsufficientAuthenticationException;
import org.springframework.security.core.Authentication;

import java.util.UUID;

public interface AuthenticationService {
    Authentication registerUser(UserRegistrationDTO userRegistrationDTO);

    UUID getAuthenticatedUserId(Authentication authentication) throws InsufficientAuthenticationException;
}
