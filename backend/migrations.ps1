param( [String]$Action, [String]$Label = "to-be-changed", [String]$envFile = ".env.development" )

# Check if the .env file exists
if (-Not (Test-Path -Path $envFile)) {
    Write-Host "Error: .env file not found at $envFile" -ForegroundColor Red
    exit 1
}

# Read the .env file and set environment variables
Get-Content $envFile | ForEach-Object {
    # Skip empty lines and comments
    if ($_ -notmatch '^\s*$' -and $_ -notmatch '^\s*#') {
        # Split the line into key and value
        $parts = $_ -split '=', 2
        if ($parts.Length -eq 2) {
            $key = $parts[0].Trim()
            $value = $parts[1].Trim()
            # Set the environment variable
            [System.Environment]::SetEnvironmentVariable($key, $value, [System.EnvironmentVariableTarget]::Process)
        }
    }
}

# Define variables
$DateWithTime = (Get-Date -Format "yyyyMMddHHmmss")
$ResourcesDirectory = "src/main/resources"
$MigrationRootDirectory = "db"
$MigrationMasterFile = "$ResourcesDirectory/$MigrationRootDirectory/db.changelog-master.yaml"
$MigrationFile = "$MigrationRootDirectory/changes/$DateWithTime-$Label.sql"

# Initialize Migration Status
$MigrationStatus = "undefined"

function Migrate {
    Write-Host "Running database migrations..."
    .\mvnw clean compile liquibase:update
}

function Status {
    Write-Host "Checking migration status..."
    # Compile the project and run Liquibase status and check for pending migrations
    $StatusOutput = .\mvnw clean compile liquibase:status

    # Count pending migrations
    $PendingMigrations = ($StatusOutput -match "(has|have) not been applied").Length

    if ($PendingMigrations -gt 0) {
        Write-Host "`e[38;5;208m[WARNING] Pending migrations exist. Apply them before generating a new migration.`e[0m"
    } else {
        Write-Host "[SUCCESS] The database is up to date. You can generate new migration files if needed."
    }

    # Update global variable
    $Global:MigrationStatus = $PendingMigrations
}

function Generate {
    Status

    if ($Global:MigrationStatus -eq 0) {
        Write-Host "Generating a new migration file..."

        .\mvnw liquibase:diff -DdiffChangeLogFileName="$DateWithTime-$Label.sql"

        # Check if the migration file was created
        if (Test-Path "$ResourcesDirectory/$MigrationFile") {
            # Append to the master changelog file
            Add-Content -Path $MigrationMasterFile -Value "  - include:"
            Add-Content -Path $MigrationMasterFile -Value "      file: $MigrationFile"
            Write-Host "Migration file created and added to $MigrationMasterFile."
        } else {
            Write-Host "No changes detected. Migration file not created."
        }
    } else {
        Write-Host "Pending migrations detected. Please apply them before generating a new migration."
    }
}

if ($Action) {
    switch ($Action.ToLower()) {
        "migrate" { Migrate }
        "status" { Status }
        "generate" { Generate }
        default { Write-Error "Invalid action: $($Action). Choose from: migrate, status, generate" }
    }
} else {
    $validActions = "migrate", "status", "generate"
    do {
        $Action = Read-Host "Enter an action ($($validActions -join ', ')):"
        if ($Action -in $validActions) {
            switch ($Action.ToLower()) {
                "migrate" { Migrate }
                "status" { Status }
                "generate" { Generate }
            }
            break
        } else {
            Write-Warning "Invalid action. Please try again."
        }
    } while ($Action -notin $validActions)
}