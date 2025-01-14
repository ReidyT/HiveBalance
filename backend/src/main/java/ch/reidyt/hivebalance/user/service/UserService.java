package ch.reidyt.hivebalance.user.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import ch.reidyt.hivebalance.user.dto.UserRegistrationDTO;
import ch.reidyt.hivebalance.user.model.BeeUser;
import ch.reidyt.hivebalance.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    public BeeUser createUser(UserRegistrationDTO userRegistrationDTO) {
        return userRepository.save(userRegistrationDTO.toUser(passwordEncoder));
    }
}
