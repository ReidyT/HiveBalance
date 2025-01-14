package ch.reidyt.hivebalance.user.dto;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserDTO {
    private UUID id;
    private String email;
    private String username;
}