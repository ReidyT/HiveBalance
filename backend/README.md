## Running Spring 

You can run the Spring backend using the `Spring Boot Dashboard` or using the maven command `./mvnw spring-boot:run`.

> [!NOTE]
> If a new migration file isn't applied after restarting the backend via the `Spring Boot Dashboard`, try running `./mvnw spring-boot:run` or rebuilding the application.

## Environment Variables

The environment variables are used for database connection configuration and liquibase, please read the `.env.development` file for more information.
These variables are set in the .env.development file and imported in the dev container through the `docker-compose.yaml`.

> [!IMPORTANT]
> If you are not using the dev-container, be sure to have imported these environment variables in the system or IDE.
> When using Intellij IDEA, you can import the env file in the Spring boot run configuration. For maven, you have to add manually in Settings -> Build -> Maven -> Runner.

> [!WARNING]
> Don't forget to rebuild the dev container after updating the env file!

## Database Migrations with Liquibase

This project uses Liquibase to manage database schema changes.  Liquibase allows us to evolve the database schema in a controlled and versioned manner, keeping it synchronized with the application code.

By default, Liquibase will run on Spring Boot's start. If you want to manage migrations manually, set the following property in `application.yaml`:

```properties
spring
    liquibase
        enabled=false
```

### Generating Migration Files

Migrations are generated automatically from your JPA entities, simplifying the process of database schema evolution.  To create a new migration file, use the following command:

```bash
.\migrations.ps1 -Action generate -Label <descriptive-migration-label>
.\migrations.sh -a generate -l <descriptive-migration-label>
```

replace `<descriptive-migration-label>` with a concise and descriptive label for your migration (e.g., add-user-table or update-product-price).

This command will:

1. Build the project.
2. Generate a new YAML changelog file in `src/main/resources/db/changelog/changes`. The filename will include a timestamp and the provided label for easy identification. 
3. Automatically update `src/main/resources/db/changelog/db.changelog-master.yaml` to include the newly generated changelog file. This ensures that the migration is applied the next time the application starts.

You can also run the following maven commands:

```bash
./mvnw compile liquibase:diff
```

You will have to:

1. Rename the generated file in the `changes` directory.
2. Append it into the changelog master file.

This "application-first" approach allows you to focus on your code, while Liquibase handles the database schema updates. The per-migration file structure keeps the changelog organized and easy to understand.

> [!IMPORTANT]
> The order of entries in `db.changelog-master.yaml` is crucial. Migrations are executed in the order they appear in this file.

> [!WARNING]
> If you generate a migration before applying a previously generated one, you'll create duplicate migration files with the same changes. Always apply pending migrations before creating new ones. If you are using the `./migrations.ps1 generate` command, the migration file won't be generated if there is any pending migration.


### Applying Migrations

Liquibase automatically applies pending migrations on application startup. No manual intervention is required.

#### (Optional) Running Migrations Manually

While migrations are typically applied automatically, you can also run them manually using the following command:

```bash
.\migrations.ps1 -Action migrate
.\migrations.sh -a migrate
``` 

or also:

```bash
./mvnw compile liquibase:update
```

This is useful for testing migrations in a development environment or for applying changes outside of the application startup process.

#### (Optional) Rollback Migrations

Liquibase allows you to rollback migrations if necessary. For more information on rolling back changes, refer to the Liquibase documentation.

### Maven Liquibase Configuration

The Liquibase Maven plugin is configured in the project's `pom.xml`.

#### Key Configuration Elements:

- **propertyFile**: Specifies the liquibase property file to use.
    - It contains only the **referenceUrl** key.
    - Need to be in properties file because Maven didn't like the **physical_naming_strategy** and **implicit_naming_strategy**.
    - **referenceUrl**: Used for Hibernate integration. Make sure this matches your project's package.
    - **implicit_naming_strategy** and **implicit_naming_strategy**: Ensure the generated migrations will use the same table names as Hibernate (snake_case). Without these properties, the naming style used by liquibase is PascalCase.
- **changeLogFile**: Specifies the master changelog file.
- **driver**: The PostgreSQL JDBC driver.
- **url**, **username**, **password**: Database connection details, drawn from environment variables.
- **liquibase-hibernate6** dependency: Ensures compatibility with Hibernate 6.


## Interacting with the API using Bruno (Postman Alternative)

This project utilizes Bruno, a convenient alternative to Postman, for interacting with and testing the backend API without needing a frontend. You can import the Bruno request collection from `docs/bruno/HiveBalance`.

### Authentication with JWT Tokens

The API uses JSON Web Tokens (JWT) for authentication. When you log in or register, the server generates an access token, which must be included in the `Authorization` header for accessing protected routes.

Bruno is configured to automatically handle the generation and usage of JWT tokens:

1. **Token Generation:**  
   The `POST /auth/login` (use `Basic Auth` and use your email or username for the login) and `POST /auth/register` routes return an `access_token` in the response body upon successful authentication or registration.

2. **Automatic Update:**  
   Bruno is configured to automatically save the `access_token` into the collection variable `{{ACCESS_TOKEN}}`.

3. **Token Injection:**  
   All protected routes within the collection are pre-configured with the `Authorization` header set to use the `Bearer {{ACCESS_TOKEN}}` format. This ensures that the correct token is included with each request to secured endpoints.

### Importing the Collection

To import the collection into Bruno:

1. Open Bruno.
2. Choose "Import Collection."
3. Select the `bruno.json` file from the `docs/bruno/HiveBalance` directory.

### Troubleshooting

If you encounter any issues with authentication or token handling, ensure that:

* You have successfully executed the `POST /auth/login` or `POST /auth/register` request to generate a valid `access_token`.
* The `Authorization` header in your protected route requests is set to `Bearer {{ACCESS_TOKEN}}`.
* The `{{ACCESS_TOKEN}}` variable contains the correct value.

If problems persist, please consult the [Spring Security documentation](https://docs.spring.io/spring-security/site/docs/current/reference/html5/) for further information on JWT-based authentication.
