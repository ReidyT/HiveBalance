package ch.reidyt.hivebalance.user.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
// The "User" is a reserved keyword in PostgreSQL, so we can't use it for the table name.
public class BeeUser {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 30, unique = true)
    private String email;

    @Column(nullable = false, length = 15, unique = true)
    private String username;

    @Column(nullable = false, length = 60)
    private String password;
}
