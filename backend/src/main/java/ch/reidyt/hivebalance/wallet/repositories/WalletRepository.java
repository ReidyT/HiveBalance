package ch.reidyt.hivebalance.wallet.repositories;

import ch.reidyt.hivebalance.wallet.dtos.GrantedWalletDTO;
import ch.reidyt.hivebalance.wallet.models.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, UUID> {
    @Query(value = """
                SELECT w.id,
                       w.name
                FROM Permission p
                INNER JOIN Wallet w ON p.wallet_id = w.id
                WHERE p.user_id = :userId
            """, nativeQuery = true)
    List<GrantedWalletDTO> findAllGrantedWalletsByUserId(@Param("userId") UUID userId);
}