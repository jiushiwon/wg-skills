#Requires -Version 5.1
<#
.SYNOPSIS
  Windows native deploy: pull -> install deps -> build -> stop old -> start new -> health check.
.PARAMETER Language
  Required. node | python | java | go
.PARAMETER Manager
  nssm | hidden. Default: nssm if an NSSM service exists, else hidden background process.
.PARAMETER Port
  Override APP_PORT (default 8080 / from .env).
.EXAMPLE
  .\launch.ps1 node -Port 8080
  .\launch.ps1 java -Manager nssm
  Standard: see deploy-native-skill/references/script-standards.md
#>
param(
    [Parameter(Mandatory = $true, Position = 0)]
    [ValidateSet('node', 'python', 'java', 'go')]
    [string]$Language,
    [ValidateSet('nssm', 'hidden')]
    [string]$Manager,
    [string]$Port,
    [string]$Branch,
    [switch]$SkipPull,
    [switch]$SkipBuild
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# ---------- load .env ----------
if (Test-Path .env) {
    Get-Content .env | ForEach-Object {
        if ($_ -match '^\s*([^#=]+)\s*=\s*(.*)\s*$') { [Environment]::SetEnvironmentVariable($Matches[1].Trim(), $Matches[2].Trim(), 'Process') }
    }
}

# ---------- defaults ----------
$AppName = if ($env:APP_NAME) { $env:APP_NAME } else { Split-Path -Leaf (Get-Location) }
$AppDir  = if ($env:APP_DIR)  { $env:APP_DIR }  else { (Get-Location).Path }
$AppPort = if ($Port) { $Port } elseif ($env:APP_PORT) { $env:APP_PORT } else { '8080' }
$AppEnv  = if ($env:APP_ENV) { $env:APP_ENV } else { 'production' }
$LogDir  = if ($env:LOG_DIR)  { $env:LOG_DIR }  else { "C:\var\log\$AppName" }
$Branch  = if ($Branch) { $Branch } elseif ($env:BRANCH) { $env:BRANCH } else { 'main' }
$HealthPath = if ($env:HEALTH_PATH) { $env:HEALTH_PATH } else { '/health' }

# ---------- logging (self-contained) ----------
$null = New-Item -ItemType Directory -Force -Path $LogDir
$LogFile = Join-Path $LogDir 'launch.log'
function Write-Log {
    param([string]$Level, [string]$Message)
    $line = "[{0}] [{1}] {2}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $Level, $Message
    $line | Tee-Object -FilePath $LogFile -Append
}
function Info { param($m) Write-Log INFO $m }
function Warn { param($m) Write-Log WARN $m }
function Err  { param($m) Write-Log ERROR $m }
function Ok   { param($m) Write-Log OK $m }
function Die  { param($m) Err $m; exit 1 }
function Have { param($c) $null -ne (Get-Command $c -ErrorAction SilentlyContinue) }
function Run  { param($c) Info ">> $c"; Invoke-Expression "$c *>> ""$LogFile"""; if ($LASTEXITCODE -ne 0) { Die "command failed: $c" } }

# ---------- per-language commands ----------
function Install-Deps {
    switch ($Language) {
        'node'   { if (Have pnpm) { Run 'pnpm install --prod --frozen-lockfile' } else { Run 'npm ci --production' } }
        'python' { Run 'python -m venv .venv'; Run '.\.venv\Scripts\pip install -r requirements.txt' }
        'java'   { if (Test-Path .\mvnw.cmd) { Run '.\mvnw.cmd -q -DskipTests package' } else { Run 'mvn -q -DskipTests package' } }
        'go'     { Run 'go mod download' }
    }
}
function Build-App {
    switch ($Language) {
        'node'   { Run 'npm run build' }
        'python' { Info 'python: no build step, skip' }
        'java'   { Info 'java: packaged in install step' }
        'go'     { Run "go build -o bin/${AppName}.exe ./..." }
    }
}
function Start-Cmd {
    switch ($Language) {
        'node'   { return 'node dist/server.js' }
        'python' { return ".\.venv\Scripts\python -m gunicorn -k uvicorn.workers.UvicornWorker -b 0.0.0.0:$AppPort app.main:app" }
        'java'   { $jar = (Get-ChildItem target\*.jar | Select-Object -First 1).FullName; return "java -jar ""$jar"" --server.port=$AppPort" }
        'go'     { return ".\bin\${AppName}.exe" }
    }
}

# ---------- stop old process ----------
function Stop-Old {
    Info "stopping old process on port $AppPort"
    if ($Manager -eq 'nssm' -and (Have nssm)) {
        Run "nssm stop $AppName"; return
    }
    $conn = Get-NetTCPConnection -LocalPort $AppPort -State Listen -ErrorAction SilentlyContinue
    if ($conn) {
        $conn.OwningProcess | Sort-Object -Unique | ForEach-Object {
            Info "kill PID $_"; Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
        }
        Start-Sleep -Seconds 2
    }
    Ok 'old process stopped'
}

# ---------- start new process ----------
function Start-New {
    $cmd = Start-Cmd
    Info "starting: $cmd (manager=$Manager, port=$AppPort)"
    $env:APP_PORT = $AppPort; $env:APP_ENV = $AppEnv
    if ($Manager -eq 'nssm' -and (Have nssm)) {
        Run "nssm start $AppName"
    } else {
        $log = Join-Path $LogDir 'app.log'
        $p = Start-Process -FilePath 'cmd.exe' -ArgumentList "/c $cmd >> ""$log"" 2>&1" -WindowStyle Hidden -PassThru
        Set-Content -Path (Join-Path $AppDir "$AppName.pid") -Value $p.Id
        Ok "started pid=$($p.Id)"
    }
}

# ---------- health check ----------
function Health-Check {
    $url = "http://127.0.0.1:$AppPort$HealthPath"
    Info "health check: $url (retry 10x)"
    for ($i = 1; $i -le 10; $i++) {
        try {
            $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 3
            if ($r.StatusCode -eq 200) { Ok "deploy OK ($url)"; return }
        } catch { Start-Sleep -Seconds 2 }
    }
    Die "health check FAILED after 20s: $url"
}

# ---------- main ----------
if (-not $Manager) {
    if ((Have nssm) -and (Get-Service -Name $AppName -ErrorAction SilentlyContinue)) { $Manager = 'nssm' } else { $Manager = 'hidden' }
}
Set-Location $AppDir
if (-not (Have git)) { Die 'missing required command: git' }
Info "==== deploy $AppName ($Language) port=$AppPort branch=$Branch manager=$Manager ===="

if (-not $SkipPull) { Info '[1/5] pull code'; Run "git fetch origin $Branch"; Run "git reset --hard origin/$Branch" } else { Info '[1/5] skip pull' }
Info '[2/5] install deps'; Install-Deps
if (-not $SkipBuild) { Info '[3/5] build'; Build-App } else { Info '[3/5] skip build' }
Info '[4/5] restart'; Stop-Old; Start-New
Info '[5/5] verify'; Health-Check

Ok "==== deploy $AppName SUCCESS (log: $LogFile) ===="
