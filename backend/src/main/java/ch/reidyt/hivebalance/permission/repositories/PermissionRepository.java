package ch.reidyt.hivebalance.permission.repositories;

import ch.reidyt.hivebalance.permission.enums.WalletPermission;
import ch.reidyt.hivebalance.permission.models.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Permission.Id> {
    @Query("""
                SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END
                FROM Permission p
                WHERE p.id.userId = :userId
                  AND p.id.walletId = :walletId
                  AND p.permission = :walletPermission
            """)
    boolean hasWalletPermission(
            @Param("userId") UUID userId,
            @Param("walletId") UUID walletId,
            @Param("walletPermission") WalletPermission walletPermission
    );

    @Modifying
    @Transactional
    @Query("DELETE FROM Permission p WHERE p.wallet.id = :walletId")
    void deleteAllByWalletId(@Param("walletId") UUID walletId);
}
