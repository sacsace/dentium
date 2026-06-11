# Setup PostgreSQL database for Dentium India (Windows)
param(
  [string]$Password,
  [string]$User = "postgres",
  [string]$Database = "dentium_india",
  [int[]]$Ports = @(5432, 5433, 5434)
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$EnvFile = Join-Path $ProjectRoot ".env"

function Get-PsqlPath {
  $candidates = @(
    "C:\Program Files\PostgreSQL\17\bin\psql.exe",
    "C:\Program Files\PostgreSQL\18\bin\psql.exe",
    "C:\Program Files\PostgreSQL\16\bin\psql.exe"
  )
  foreach ($path in $candidates) {
    if (Test-Path $path) { return $path }
  }
  throw "psql.exe not found. Install PostgreSQL or add psql to PATH."
}

function Encode-DatabasePassword([string]$value) {
  [uri]::EscapeDataString($value)
}

if (-not $Password) {
  $secure = Read-Host "Enter PostgreSQL password for user '$User'" -AsSecureString
  $Password = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  )
}

$psql = Get-PsqlPath
$connectedPort = $null

foreach ($port in $Ports) {
  $env:PGPASSWORD = $Password
  $result = & $psql -U $User -h localhost -p $port -d postgres -tAc "SELECT 1" 2>&1
  if ($LASTEXITCODE -eq 0 -and $result -match "1") {
    $connectedPort = $port
    Write-Host "Connected to PostgreSQL on port $port" -ForegroundColor Green
    break
  }
}

if (-not $connectedPort) {
  Write-Host ""
  Write-Host "Could not connect with the provided password on ports: $($Ports -join ', ')" -ForegroundColor Red
  Write-Host "Update DATABASE_URL in .env with your actual PostgreSQL username and password."
  Write-Host "Example: postgresql://postgres:YOUR_PASSWORD@localhost:5432/dentium_india?schema=public"
  exit 1
}

$dbExists = & $psql -U $User -h localhost -p $connectedPort -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$Database'" 2>&1
if ($dbExists -notmatch "1") {
  Write-Host "Creating database '$Database'..."
  & $psql -U $User -h localhost -p $connectedPort -d postgres -c "CREATE DATABASE $Database" | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "Failed to create database '$Database'" }
}

$encodedPassword = Encode-DatabasePassword $Password
$newUrl = "postgresql://${User}:${encodedPassword}@localhost:${connectedPort}/${Database}?schema=public"

if (Test-Path $EnvFile) {
  $content = Get-Content $EnvFile -Raw
  if ($content -match '(?m)^DATABASE_URL=') {
    $content = $content -replace '(?m)^DATABASE_URL=.*', "DATABASE_URL=`"$newUrl`""
  } else {
    $content = "DATABASE_URL=`"$newUrl`"`r`n$content"
  }
  Set-Content -Path $EnvFile -Value $content.TrimEnd() -NoNewline
  Add-Content -Path $EnvFile -Value ""
} else {
  Copy-Item (Join-Path $ProjectRoot ".env.example") $EnvFile
  (Get-Content $EnvFile -Raw) -replace '(?m)^DATABASE_URL=.*', "DATABASE_URL=`"$newUrl`"" | Set-Content $EnvFile
}

Write-Host "Updated .env DATABASE_URL (port $connectedPort)"

Push-Location $ProjectRoot
try {
  $env:DATABASE_URL = $newUrl
  npm run db:migrate:deploy
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  npm run db:seed
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  Write-Host ""
  Write-Host "Database setup complete. Restart the dev server: npm run dev" -ForegroundColor Green
} finally {
  Pop-Location
  Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
}
