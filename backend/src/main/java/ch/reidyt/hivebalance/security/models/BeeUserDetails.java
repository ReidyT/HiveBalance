package ch.reidyt.hivebalance.security.models;

import java.util.Arrays;
import java.util.Collection;
import java.util.UUID;

import org.springframework.security.core.CredentialsContainer;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import ch.reidyt.hivebalance.user.models.BeeUser;
import lombok.Getter;

@Getter
public class BeeUserDetails implements UserDetails, CredentialsContainer {

    private UUID id;

    private String email;

    private String username;

    private String password;

    public BeeUserDetails(BeeUser beeUser) {
        id = beeUser.getId();
        email = beeUser.getEmail();
        username = beeUser.getUsername();
        password = beeUser.getPassword();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Arrays.asList(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    public void eraseCredentials() {
        password = null;
    }

}
