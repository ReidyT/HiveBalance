package ch.reidyt.hivebalance.permission.models;

import ch.reidyt.hivebalance.permission.enums.WalletPermission;
import ch.reidyt.hivebalance.user.models.BeeUser;
import ch.reidyt.hivebalance.wallet.models.Wallet;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(indexes = {
        @Index(name = "idx_permission_wallet", columnList = "wallet_id"),
        @Index(name = "idx_permission_user", columnList = "user_id")
})
@Data
@NoArgsConstructor
@Builder
public class Permission {
    @EmbeddedId
    private Id id;

    @ManyToOne(fetch = FetchType.LAZY) // Lazy loading applied
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false, insertable = false, updatable = false)
    private BeeUser beeUser;

    @ManyToOne(fetch = FetchType.LAZY) // Lazy loading applied
    @JoinColumn(name = "wallet_id", referencedColumnName = "id", nullable = false, insertable = false, updatable = false)
    private Wallet wallet;

    @Enumerated(EnumType.STRING) // Store as a String
    @Column(nullable = false, length = 10)
    private WalletPermission permission;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    public Permission(Id id, BeeUser beeUser, Wallet wallet, WalletPermission permission, Instant createdAt) {
        if (id == null) {
            this.id = new Id(beeUser.getId(), wallet.getId());
        } else if (!id.userId.equals(beeUser.getId())) {
            throw new IllegalStateException("The given id should contains the same user id as in the given user.");
        } else if (!id.walletId.equals(wallet.getId())) {
            throw new IllegalStateException("The given id should contains the same wallet id as in the given wallet.");
        }

        this.beeUser = beeUser;
        this.wallet = wallet;
        this.permission = permission;

        if (createdAt == null) {
            this.createdAt = Instant.now();
        } else {
            this.createdAt = createdAt;
        }
    }

    // Composite primary key
    @Embeddable
    @AllArgsConstructor
    @NoArgsConstructor
    @EqualsAndHashCode
    @Builder
    public static class Id implements Serializable {
        @Column(name = "user_id")
        private UUID userId;

        @Column(name = "wallet_id")
        private UUID walletId;
    }
}
