package ch.reidyt.hivebalance.user.model;

import java.util.Arrays;
import java.util.Collection;
import java.util.UUID;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Entity
@Getter
@RequiredArgsConstructor
// The "User" is a reserved keyword in PostgreSQL, so we can't used it for the
// table name.
public class BeeUser implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 30, unique = true)
    private final String email;

    @Column(nullable = false, length = 15, unique = true)
    private final String username;

    @Column(nullable = false, length = 60)
    private final String password;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Arrays.asList(new SimpleGrantedAuthority("ROLE_USER"));
    }
}