## Running Spring 

You can run the Spring backend using the `Spring Boot Dashboard` or using the maven command `./mvnw spring-boot:run`.

> [!INFO]
> If a new migration file isn't applied after restarting the backend via the `Spring Boot Dashboard`, try running `./mvnw spring-boot:run` or rebuilding the application.

## Environment Variables

The following environment variables are used for database connection configuration and liquibase:

```
POSTGRES_HOST=postgresdb
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=postgres

LIQUIBASE_COMMAND_URL=jdbc:postgresql://postgresdb:5432/postgres
```

These variables are set in the .env.development file and imported in the dev container through the `docker-compose.yaml`.

## Database Migrations with Liquibase

This project uses Liquibase to manage database schema changes.  Liquibase allows us to evolve the database schema in a controlled and versioned manner, keeping it synchronized with the application code.

### Generating Migration Files

Migrations are generated automatically from your JPA entities, simplifying the process of database schema evolution.  To create a new migration file, use the following command:

```bash
make generateMigration MIGRATION_LABEL="<descriptive-migration-label>"
```

replace `<descriptive-migration-label>` with a concise and descriptive label for your migration (e.g., add-user-table or update-product-price).

This command will:

1. Generate a new YAML changelog file in `src/main/resources/db/changelog/changes`. The filename will include a timestamp and the provided label for easy identification. 
2. Automatically update `src/main/resources/db/changelog/db.changelog-master.yaml` to include the newly generated changelog file. This ensures that the migration is applied the next time the application starts.

This "application-first" approach allows you to focus on your code, while Liquibase handles the database schema updates. The per-migration file structure keeps the changelog organized and easy to understand.

> [!IMPORTANT]
> The order of entries in `db.changelog-master.yaml` is crucial. Migrations are executed in the order they appear in this file.

> [!WARNING]
> If you generate a migration before applying a previously generated one, you'll create duplicate migration files with the same changes. Always apply pending migrations before creating new ones. If you are using the `make generateMigration` command, the migration file won't be generated if there is any pending migration.


### Applying Migrations

Liquibase automatically applies pending migrations on application startup. No manual intervention is required.

#### (Optional) Running Migrations Manually

While migrations are typically applied automatically, you can also run them manually using the following command:

```bash
make runMigrations
``` 

This is useful for testing migrations in a development environment or for applying changes outside of the application startup process.

#### (Optional) Rollback Migrations

Liquibase allows you to rollback migrations if necessary. For more information on rolling back changes, refer to the Liquibase documentation.

### Maven Liquibase Configuration

The Liquibase Maven plugin is configured in the project's `pom.xml`:

```xml
<plugin>
    <groupId>org.liquibase</groupId>
    <artifactId>liquibase-maven-plugin</artifactId>
    <version>...</version>
    <configuration>
        <changeLogFile>...</changeLogFile>
        <driver>...</driver>
        <referenceUrl>...</referenceUrl>
        <url>${env.LIQUIBASE_COMMAND_URL}</url>
        <username>${env.POSTGRES_USER}</username>
        <password>${env.POSTGRES_PASSWORD}</password>
    </configuration>
    <dependencies>
        <dependency>
            <groupId>org.liquibase.ext</groupId>
            <artifactId>liquibase-hibernate6</artifactId>
            <version>4.30.0</version>
        </dependency>
        <!-- ... other dependencies -->
    </dependencies>
</plugin>
```

#### Key Configuration Elements:

- changeLogFile: Specifies the master changelog file.
- driver: The PostgreSQL JDBC driver.
- referenceUrl: Used for Hibernate integration. Make sure this matches your project's package.
- url, username, password: Database connection details, drawn from environment variables.
- liquibase-hibernate6 dependency: Ensures compatibility with Hibernate 6.