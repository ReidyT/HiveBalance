package ch.reidyt.hivebalance.security.services;

import org.springframework.security.core.Authentication;

import ch.reidyt.hivebalance.security.dtos.UserRegistrationDTO;

public interface AuthenticationService {
    public Authentication registerUser(UserRegistrationDTO userRegistrationDTO);
}
