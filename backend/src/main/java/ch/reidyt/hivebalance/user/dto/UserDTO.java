package ch.reidyt.hivebalance.user.dto;

import java.util.UUID;

import ch.reidyt.hivebalance.user.model.BeeUser;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserDTO {
    private final UUID id;
    private final String email;
    private final String username;

    public static UserDTO fromEntity(BeeUser beeUser) {
        return new UserDTO(beeUser.getId(), beeUser.getEmail(),
                beeUser.getUsername());
    }
}