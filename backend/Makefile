MIGRATION_LABEL = "to-be-changed"
DATE_WITH_TIME := $(shell /bin/date "+%Y%m%d%H%M%S")

SEARCH_PATH := src/main/resources
MIGRATION_ROOT_DIRECTORY := db/changelog
MIGRATION_MASTER_FILE_RELATIVE := ${MIGRATION_ROOT_DIRECTORY}/db.changelog-master.yaml
MIGRATION_MASTER_FILE := ${SEARCH_PATH}/${MIGRATION_MASTER_FILE_RELATIVE}
MIGRATION_FILE_RELATIVE := changes/${DATE_WITH_TIME}-${MIGRATION_LABEL}.yaml
MIGRATION_FILE := ${MIGRATION_ROOT_DIRECTORY}/${MIGRATION_FILE_RELATIVE}
DIFF_CHANGELOG_FILE := ${SEARCH_PATH}/${MIGRATION_FILE}

generateMigration:
	mvn liquibase:diff -DsearchPath=${SEARCH_PATH} -DdiffChangeLogFile=${DIFF_CHANGELOG_FILE}
	@if [ -f ${SEARCH_PATH}/${MIGRATION_FILE} ]; then \
		echo "  - include:" >> $(MIGRATION_MASTER_FILE); \
		echo "      file: $(MIGRATION_FILE)" >> $(MIGRATION_MASTER_FILE); \
		echo "Migration file created and added to $(MIGRATION_MASTER_FILE)"; \
	else \
		echo "No changes detected. Migration file not created."; \
	fi

runMigrations:
	mvn liquibase:update -DsearchPath=${SEARCH_PATH} -DchangeLogMasterFile=${MIGRATION_MASTER_FILE_RELATIVE}
