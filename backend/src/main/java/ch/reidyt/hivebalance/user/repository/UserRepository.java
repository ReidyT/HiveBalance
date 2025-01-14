package ch.reidyt.hivebalance.user.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import ch.reidyt.hivebalance.user.model.BeeUser;

@Repository
public interface UserRepository extends JpaRepository<BeeUser, UUID> {
  Optional<BeeUser> findByUsername(String username);
}