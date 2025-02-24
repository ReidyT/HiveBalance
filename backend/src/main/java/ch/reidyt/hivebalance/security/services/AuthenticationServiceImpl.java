package ch.reidyt.hivebalance.security.services;

import ch.reidyt.hivebalance.security.dtos.UserRegistrationDTO;
import ch.reidyt.hivebalance.user.errors.UserNotFoundException;
import ch.reidyt.hivebalance.user.models.BeeUser;
import ch.reidyt.hivebalance.user.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {
    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final AuthenticationManager authenticationManager;

    public Authentication registerUser(UserRegistrationDTO userRegistrationDTO) {
        userRepository.save(userRegistrationDTO.toUser(passwordEncoder));

        var usernamePasswordToken = UsernamePasswordAuthenticationToken.unauthenticated(userRegistrationDTO.email(),
                userRegistrationDTO.password());

        return authenticationManager.authenticate(usernamePasswordToken);
    }

    public BeeUser getAuthenticatedUser(Authentication authentication) throws UserNotFoundException {
        return userRepository.findById(UUID.fromString(authentication.getName()))
                .orElseThrow(() -> new UserNotFoundException(authentication.getName()));
    }
}
