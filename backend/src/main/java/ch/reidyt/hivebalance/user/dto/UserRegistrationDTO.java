package ch.reidyt.hivebalance.user.dto;

import org.springframework.security.crypto.password.PasswordEncoder;

import ch.reidyt.hivebalance.user.model.BeeUser;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserRegistrationDTO {
    @Email(message = "Invalid email format")
    @NotBlank(message = "Email cannot be blank")
    @Size(min = 6, max = 30, message = "Email must be between 6 and 30 characters")
    private String email;

    @NotBlank(message = "Username cannot be blank")
    @Size(min = 3, max = 15, message = "Username must be between 3 and 15 characters")
    private String username;

    @NotBlank(message = "Password cannot be blank")
    @Size(min = 8, max = 30, message = "Password must be between 8 and 30 characters")
    private String password;

    public BeeUser toUser(PasswordEncoder passwordEncoder) {
        return new BeeUser(email, username, passwordEncoder.encode(password));
    }
}