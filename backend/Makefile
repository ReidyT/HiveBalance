# This Makefile allows to manage db migrations.
.SILENT:

MIGRATION_LABEL = "to-be-changed"
DATE_WITH_TIME := $(shell /bin/date "+%Y%m%d%H%M%S")
RESOURCES_DIRECTORY := src/main/resources
MIGRATION_ROOT_DIRECTORY := db/changelog
MIGRATION_MASTER_FILE_RELATIVE := ${MIGRATION_ROOT_DIRECTORY}/db.changelog-master.yaml
MIGRATION_MASTER_FILE := ${RESOURCES_DIRECTORY}/${MIGRATION_MASTER_FILE_RELATIVE}
MIGRATION_FILE_RELATIVE := changes/${DATE_WITH_TIME}-${MIGRATION_LABEL}.yaml
MIGRATION_FILE := ${MIGRATION_ROOT_DIRECTORY}/${MIGRATION_FILE_RELATIVE}
DIFF_CHANGELOG_FILE := ${RESOURCES_DIRECTORY}/${MIGRATION_FILE}

MIGRATION_STATUS := undefined

runMigrations:
	mvn liquibase:update -DsearchPath=${RESOURCES_DIRECTORY} -DchangeLogMasterFile=${MIGRATION_MASTER_FILE_RELATIVE}

check_migrations_status = $(eval MIGRATION_STATUS := $(shell mvn liquibase:status -DsearchPath=${RESOURCES_DIRECTORY} -DchangeLogMasterFile=${MIGRATION_MASTER_FILE_RELATIVE} | tee /dev/tty | grep -c -i "has not been applied" | tr -d '\n')) \
                          $(if $(filter-out 0,$(MIGRATION_STATUS)), \
                              @echo "\033[38;5;208m[WARNING] Pending migrations exist. Apply them before generating a new migration.\033[0m", \
                              @echo "[SUCCESS] The database is up to date. You can generate new migration files if needed.")

checkMigrations:
	$(call check_migrations_status);

generateMigration:
	$(call check_migrations_status); \
	if [ "$(MIGRATION_STATUS)" -eq 0 ]; then \
		mvn liquibase:diff -DsearchPath=${RESOURCES_DIRECTORY} -DdiffChangeLogFile=${DIFF_CHANGELOG_FILE} -Dliquibase.changeLogFile=${MIGRATION_MASTER_FILE_RELATIVE}; \
		if [ -f ${RESOURCES_DIRECTORY}/${MIGRATION_FILE} ]; then \
			echo "  - include:" >> $(MIGRATION_MASTER_FILE); \
			echo "      file: $(MIGRATION_FILE)" >> $(MIGRATION_MASTER_FILE); \
			echo "Migration file created and added to $(MIGRATION_MASTER_FILE)"; \
		else \
			echo "No changes detected. Migration file not created."; \
		fi \
	fi