package ch.reidyt.hivebalance.security.models;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(indexes = {
        @Index(name = "idx_token_parent_id", columnList = "parentId"),
        @Index(name = "idx_token_user_id", columnList = "userId"),
        @Index(name = "idx_token_expire_at", columnList = "expireAt")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Token {
    @Id
    @Column(name = "token_id")
    private UUID tokenId;

    // No @ManyToOne/@JoinColumn and FK constraint for performance reasons.
    // Token validity is checked externally, and userId is primarily used for
    // blacklisting.
    // Orphaned tokens (with non-existent userIds) are handled by a separate cleanup
    // process.
    @Column(name = "parent_id", nullable = true)
    private UUID parentId; // Self-referencing for refresh token hierarchy

    // No @ManyToOne/@JoinColumn and FK constraint for performance reasons.
    // Token validity is checked externally, and userId is primarily used for
    // blacklisting.
    // Orphaned tokens (with non-existent userIds) are handled by a separate cleanup
    // process.
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "type", nullable = false)
    @Enumerated(EnumType.STRING)
    private TokenType type;

    @Column(name = "expire_at", nullable = false)
    private Instant expireAt;

    @Builder.Default
    @Column(name = "is_blacklisted", nullable = false)
    private boolean isBlacklisted = false;

    public static Token from(JwtToken jwtToken, UUID parentId) {
        return Token.builder()
                .tokenId(jwtToken.getTokenId())
                .parentId(parentId)
                .userId(jwtToken.getUserId())
                .type(jwtToken.getTokenType())
                .expireAt(jwtToken.getExpiresAt())
                .build();
    }
}