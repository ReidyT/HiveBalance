package ch.reidyt.hivebalance.user.repositories;

import ch.reidyt.hivebalance.user.models.BeeUser;
import ch.reidyt.hivebalance.user.projections.EmailAndUsernameProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<BeeUser, UUID> {
    @Query("""
            SELECT be
            FROM BeeUser be
            WHERE LOWER(be.email) = LOWER(:loginIdentifier)
             OR LOWER(be.username) = LOWER(:loginIdentifier)
            """)
    Optional<BeeUser> findByLoginIdentifier(String loginIdentifier);

    @Query("""
            SELECT new ch.reidyt.hivebalance.user.projections.EmailAndUsernameProjection(be.email, be.username)
            FROM BeeUser be
            WHERE LOWER(be.email) = LOWER(:email)
             OR LOWER(be.username) = LOWER(:username)
            """)
    List<EmailAndUsernameProjection> findByEmailOrUsername(String email, String username);
}