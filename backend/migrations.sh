#!/bin/bash

# Set default values
action=""
label="to-be-changed"
env_file=".env.development"

# Process command-line arguments
while getopts ":a:l:e:" opt; do
  case $opt in
    a)
      action="$OPTARG"
      ;;
    l)
      label="$OPTARG"
      ;;
    e)
      env_file="$OPTARG"
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      exit 1
      ;;
    :)
      echo "Option -$OPTARG requires an argument." >&2
      exit 1
      ;;
  esac
done

# Check if .env file exists
if [ ! -f "$env_file" ]; then
  echo "Error: .env file not found at $env_file" >&2
  exit 1
fi

# Load environment variables from .env file
(export $(grep -v '^#' "$env_file" | xargs)) && echo "Environment variables loaded successfully." || echo "Error loading environment variables."

# Define variables
date_with_time=$(date +%Y%m%d%H%M%S)
resources_directory="src/main/resources"
migration_root_directory="db"
migration_master_file="$resources_directory/$migration_root_directory/db.changelog-master.yaml"
migration_file="$migration_root_directory/changes/$date_with_time-$label.sql"

# Functions
migrate() {
  echo "Running database migrations..."
  ./mvnw clean compile liquibase:update
}

status() {
  echo "Checking migration status..."
  status_output=$(./mvnw clean compile liquibase:status)
  pending_migrations=$(echo "$status_output" | grep -c "has|have not been applied")
  if [ $pending_migrations -gt 0 ]; then
    echo -e "\e[38;5;208m[WARNING] Pending migrations exist. Apply them before generating a new migration.\e[0m"
  else
    echo "[SUCCESS] The database is up to date. You can generate new migration files if needed."
  fi
  migration_status=$pending_migrations
}

generate() {
  status
  if [ $migration_status -eq 0 ]; then
    echo "Generating a new migration file..."
    ./mvnw liquibase:diff -DdiffChangeLogFileName="$date_with_time-$label.sql"
    if [ -f "$resources_directory/$migration_file" ]; then
      echo "  - include:" >> "$migration_master_file"
      echo "      file: $migration_file" >> "$migration_master_file"
      echo "Migration file created and added to $migration_master_file."
    else
      echo "No changes detected. Migration file not created."
    fi
  else
    echo "Pending migrations detected. Please apply them before generating a new migration."
  fi
}

# Main execution
if [ -z "$action" ]; then
  read -p "Enter an action (migrate, status, generate): " action
fi

case "$action" in
  migrate)
    migrate
    ;;
  status)
    status
    ;;
  generate)
    generate
    ;;
  *)
    echo "Invalid action: $action. Choose from: migrate, status, generate" >&2
    exit 1
    ;;
esac

exit 0