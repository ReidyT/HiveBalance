package ch.reidyt.hivebalance.security.services;

import ch.reidyt.hivebalance.security.dtos.UserRegistrationDTO;
import ch.reidyt.hivebalance.user.errors.UserNotFoundException;
import ch.reidyt.hivebalance.user.models.BeeUser;
import org.springframework.security.core.Authentication;

public interface AuthenticationService {
    Authentication registerUser(UserRegistrationDTO userRegistrationDTO);

    BeeUser getAuthenticatedUser(Authentication authentication) throws UserNotFoundException;
}
