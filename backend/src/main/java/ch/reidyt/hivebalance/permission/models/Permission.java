package ch.reidyt.hivebalance.permission.models;

import ch.reidyt.hivebalance.permission.enums.WalletPermission;
import ch.reidyt.hivebalance.user.models.BeeUser;
import ch.reidyt.hivebalance.wallet.models.Wallet;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Table(indexes = {
        @Index(name = "idx_permission_wallet", columnList = "wallet_id"),
        @Index(name = "idx_permission_user", columnList = "user_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Permission {
    @EmbeddedId
    private PermissionId id; // Composite primary key

    @ManyToOne(fetch = FetchType.LAZY) // Lazy loading applied
    @MapsId("beeUser") // Maps to `beeUser` in PermissionId
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    private BeeUser beeUser;

    @ManyToOne(fetch = FetchType.LAZY) // Lazy loading applied
    @MapsId("wallet") // Maps to `wallet` in PermissionId
    @JoinColumn(name = "wallet_id", referencedColumnName = "id", nullable = false)
    private Wallet wallet;

    @Enumerated(EnumType.STRING) // Store as a String
    @Column(nullable = false, length = 10)
    private WalletPermission permission;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;
}
