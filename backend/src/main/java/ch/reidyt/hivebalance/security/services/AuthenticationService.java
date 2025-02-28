package ch.reidyt.hivebalance.security.services;

import ch.reidyt.hivebalance.security.dtos.UserRegistrationDTO;
import ch.reidyt.hivebalance.user.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.InsufficientAuthenticationException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final AuthenticationManager authenticationManager;

    @Transactional
    public Authentication registerUser(UserRegistrationDTO userRegistrationDTO) {
        userRepository.save(userRegistrationDTO.toUser(passwordEncoder));

        var usernamePasswordToken = UsernamePasswordAuthenticationToken.unauthenticated(userRegistrationDTO.email(),
                userRegistrationDTO.password());

        return authenticationManager.authenticate(usernamePasswordToken);
    }

    public UUID getAuthenticatedUserId(Authentication authentication) throws InsufficientAuthenticationException {
        if (!authentication.isAuthenticated()) {
            throw new InsufficientAuthenticationException("The user must be authenticated to retrieve its ID.");
        }
        return UUID.fromString(authentication.getName());
    }
}
