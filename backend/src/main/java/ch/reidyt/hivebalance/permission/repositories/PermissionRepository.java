package ch.reidyt.hivebalance.permission.repositories;

import ch.reidyt.hivebalance.permission.models.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, UUID> {
}
