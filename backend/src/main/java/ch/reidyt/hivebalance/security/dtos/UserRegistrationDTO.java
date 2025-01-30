package ch.reidyt.hivebalance.security.dtos;

import ch.reidyt.hivebalance.security.validators.Email;
import ch.reidyt.hivebalance.security.validators.Password;
import ch.reidyt.hivebalance.security.validators.Username;
import ch.reidyt.hivebalance.user.models.BeeUser;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.security.crypto.password.PasswordEncoder;

public record UserRegistrationDTO(

        @Email
        @NotBlank(message = "Email cannot be blank")
        @Size(min = 6, max = 30, message = "Email must be between 6 and 30 characters")
        String email,

        @Username
        @NotBlank(message = "Username cannot be blank")
        @Size(min = 3, max = 15, message = "Username must be between 3 and 15 characters")
        String username,

        @Password
        @NotBlank(message = "Password cannot be blank")
        @Size(min = 8, max = 30, message = "Password must be between 8 and 30 characters")
        String password
) {
    public BeeUser toUser(PasswordEncoder passwordEncoder) {
        return BeeUser.builder().email(email).username(username).password(passwordEncoder.encode(password)).build();
    }
}
