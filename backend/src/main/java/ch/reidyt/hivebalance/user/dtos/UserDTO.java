package ch.reidyt.hivebalance.user.dtos;

import java.util.UUID;

import ch.reidyt.hivebalance.security.models.BeeUserDetails;
import ch.reidyt.hivebalance.user.models.BeeUser;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserDTO {
    private final UUID id;
    private final String email;
    private final String username;

    public static UserDTO from(BeeUser beeUser) {
        return new UserDTO(beeUser.getId(), beeUser.getEmail(),
                beeUser.getUsername());
    }

    public static UserDTO from(BeeUserDetails beeUserDetails) {
        return new UserDTO(beeUserDetails.getId(), beeUserDetails.getEmail(),
                beeUserDetails.getUsername());
    }
}