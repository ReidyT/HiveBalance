package ch.reidyt.hivebalance.user.repositories;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import ch.reidyt.hivebalance.user.models.BeeUser;

@Repository
public interface UserRepository extends JpaRepository<BeeUser, UUID> {
    @Query("SELECT be FROM BeeUser be WHERE (LOWER(be.email) = LOWER(:loginIdentifier) OR LOWER(be.username) = LOWER(:loginIdentifier))")
    Optional<BeeUser> findByLoginIdentifier(String loginIdentifier);
}