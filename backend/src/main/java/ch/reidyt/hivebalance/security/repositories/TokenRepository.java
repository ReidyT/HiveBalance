package ch.reidyt.hivebalance.security.repositories;

import java.time.Instant;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import ch.reidyt.hivebalance.security.models.Token;

@Repository
public interface TokenRepository extends JpaRepository<Token, UUID> {
    @Query("SELECT t.isBlacklisted FROM Token t WHERE t.tokenId = :tokenId")
    boolean isBlacklisted(UUID tokenId);

    @Transactional
    @Modifying
    @Query("UPDATE Token t SET t.isBlacklisted = true WHERE t.parentId = :refreshTokenId OR t.tokenId = :refreshTokenId")
    void blacklistByRefreshToken(UUID refreshTokenId);

    @Transactional
    @Modifying
    @Query(value = "WITH RelatedTokens AS (" +
            "           SELECT parent_id AS token_id " +
            "           FROM token " +
            "           WHERE token_id = :accessTokenId " +
            "           UNION ALL " +
            "           SELECT :accessTokenId " +
            "       ) " +
            "       UPDATE token " +
            "       SET is_blacklisted = 'true' " +
            "       FROM RelatedTokens " +
            "       WHERE token.token_id = RelatedTokens.token_id", nativeQuery = true)
    void blacklistByAccessToken(UUID accessTokenId);

    @Transactional
    @Modifying
    @Query("UPDATE Token t SET t.isBlacklisted = true WHERE t.userId = :userId")
    void blacklistByUserId(UUID userId);

    @Transactional
    @Modifying
    @Query("DELETE FROM Token t WHERE NOT EXISTS (SELECT 1 FROM BeeUser u WHERE u.id = t.userId) OR t.expireAt < :now")
    int deleteInvalidTokens(Instant now);
}
