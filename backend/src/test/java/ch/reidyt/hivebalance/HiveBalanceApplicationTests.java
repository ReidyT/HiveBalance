package ch.reidyt.hivebalance;

import ch.reidyt.hivebalance.base.config.TestDatabaseConfig;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class HiveBalanceApplicationTests {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = TestDatabaseConfig.createPostgreSQLContainer();

    @Test
    void contextLoads() {
    }

}
