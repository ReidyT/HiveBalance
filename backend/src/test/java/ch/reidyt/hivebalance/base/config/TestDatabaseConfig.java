package ch.reidyt.hivebalance.base.config;

import org.testcontainers.containers.PostgreSQLContainer;

public class TestDatabaseConfig {
    public static PostgreSQLContainer<?> createPostgreSQLContainer() {
        return new PostgreSQLContainer<>("postgres:17.2");
    }
}
