package ch.reidyt.hivebalance.user.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public class UserLoginDTO {
    @NotBlank(message = "Login identifier cannot be blank")
    private final String loginIdentifier; // email or password can be used to log in
    @NotBlank(message = "Password cannot be blank")
    private final String password;
}
