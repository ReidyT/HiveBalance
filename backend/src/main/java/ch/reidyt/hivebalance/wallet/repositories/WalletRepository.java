package ch.reidyt.hivebalance.wallet.repositories;

import ch.reidyt.hivebalance.wallet.dtos.GrantedWalletDTO;
import ch.reidyt.hivebalance.wallet.models.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, UUID> {
    @Query("""
            SELECT new ch.reidyt.hivebalance.wallet.dtos.GrantedWalletDTO(p.wallet.id, p.wallet.name)
            FROM Permission p
            INNER JOIN FETCH Wallet w ON p.wallet.id = w.id
            WHERE p.beeUser.id = :userId
            """)
    List<GrantedWalletDTO> findAllGrantedWalletsByUserId(@Param("userId") UUID userId);

    @Query("""
            SELECT w
            FROM Wallet w
            INNER JOIN Permission p ON w.id = p.wallet.id
            WHERE w.id = :walletId AND p.beeUser.id = :userId
            """)
    Optional<Wallet> findGrantedWalletById(@Param("userId") UUID userId, @Param("walletId") UUID walletId);
}