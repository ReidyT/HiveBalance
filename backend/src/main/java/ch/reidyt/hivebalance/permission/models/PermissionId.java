package ch.reidyt.hivebalance.permission.models;

import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.UUID;

@Embeddable
public class PermissionId implements Serializable {
    private UUID beeUser;  // Matches BeeUser ID
    private UUID wallet;    // Matches Wallet ID
}
