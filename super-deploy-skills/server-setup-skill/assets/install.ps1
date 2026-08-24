#Requires -Version 5.1
<#
.SYNOPSIS
  Idempotent install of deploy runtimes on Windows Server.
.PARAMETER Component
  Required. jdk | node | python | go | nginx | docker
.PARAMETER Version
  Optional. Defaults: JDK=17 / Node=22 / Python=3.11 / Go=1.22.
.EXAMPLE
  .\install.ps1 jdk -Version 17
  .\install.ps1 nginx
  Standard: see deploy-native-skill/references/script-standards.md
#>
param(
    [Parameter(Mandatory = $true, Position = 0)]
    [ValidateSet('jdk', 'node', 'python', 'go', 'nginx', 'docker')]
    [string]$Component,
    [string]$Version,
    [switch]$Yes
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# ---------- defaults ----------
$AppName = if ($env:APP_NAME) { $env:APP_NAME } else { 'deploy' }
$LogDir  = if ($env:LOG_DIR)  { $env:LOG_DIR }  else { "C:\var\log\$AppName" }

# ---------- logging (self-contained) ----------
$null = New-Item -ItemType Directory -Force -Path $LogDir
$LogFile = Join-Path $LogDir 'install.log'
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

# ---------- privilege / package manager ----------
function Assert-Admin {
    $isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    if (-not $isAdmin) { Die 'administrator privilege required (run PowerShell as Administrator)' }
}
function Get-PM {
    if (Have winget) { return 'winget' }
    if (Have choco)  { return 'choco' }
    Die 'neither winget nor chocolatey found; install winget first (built-in on Win10 1809+)'
}

# ---------- component installers ----------
function Install-Jdk {
    $v = if ($Version) { $Version } else { '17' }
    if ((Have java) -and ((java -version 2>&1) -match """$v")) { Ok "JDK $v already installed, skip"; return }
    Info "installing OpenJDK $v (pm=$PM)"
    switch ($PM) {
        'winget' { Run "winget install --id Microsoft.OpenJDK.$v --silent --accept-package-agreements --accept-source-agreements" }
        'choco'  { Run "choco install -y openjdk$v" }
    }
    Ok "JDK $v installed (re-open terminal to refresh PATH)"
}

function Install-Node {
    $v = if ($Version) { $Version } else { '22' }
    if ((Have node) -and ([int]((node -v).TrimStart('v').Split('.')[0]) -ge [int]$v)) { Ok "Node.js $(node -v) already installed, skip"; return }
    Info "installing Node.js $v (pm=$PM)"
    switch ($PM) {
        'winget' { Run 'winget install --id OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements' }
        'choco'  { Run 'choco install -y nodejs-lts' }
    }
    Ok "Node.js installed (re-open terminal to refresh PATH)"
}

function Install-Python {
    $v = if ($Version) { $Version } else { '3.11' }
    if ((Have python) -and ((python -V 2>&1) -match $v)) { Ok "Python $v already installed, skip"; return }
    Info "installing Python $v (pm=$PM)"
    switch ($PM) {
        'winget' { Run "winget install --id Python.Python.$v --silent --accept-package-agreements --accept-source-agreements" }
        'choco'  { Run "choco install -y python --version=$v" }
    }
    Ok "Python $v installed"
}

function Install-Go {
    $v = if ($Version) { $Version } else { '1.22' }
    if ((Have go) -and ((go version) -match "go$v")) { Ok "Go $v already installed, skip"; return }
    Info "installing Go $v (pm=$PM)"
    switch ($PM) {
        'winget' { Run 'winget install --id GoLang.Go --silent --accept-package-agreements --accept-source-agreements' }
        'choco'  { Run 'choco install -y golang' }
    }
    Ok "Go installed (re-open terminal to refresh PATH)"
}

function Install-Nginx {
    if (Have nginx) { Ok 'Nginx already installed, skip'; return }
    Info "installing Nginx (pm=$PM)"
    switch ($PM) {
        'winget' { Run 'winget install --id nginxinc.nginx --silent --accept-package-agreements --accept-source-agreements' }
        'choco'  { Run 'choco install -y nginx' }
    }
    Ok 'Nginx installed (default path C:\nginx; configure and start manually)'
}

function Install-Docker {
    if (Have docker) { Ok "Docker $(docker -v) already installed, skip"; return }
    Info "installing Docker Desktop (pm=$PM)"
    switch ($PM) {
        'winget' { Run 'winget install --id Docker.DockerDesktop --silent --accept-package-agreements --accept-source-agreements' }
        'choco'  { Run 'choco install -y docker-desktop' }
    }
    Ok 'Docker Desktop installed (reboot or start Docker Desktop manually)'
}

# ---------- main ----------
Assert-Admin
$PM = Get-PM
Info "detected package manager: $PM"

switch ($Component) {
    'jdk'    { Install-Jdk }
    'node'   { Install-Node }
    'python' { Install-Python }
    'go'     { Install-Go }
    'nginx'  { Install-Nginx }
    'docker' { Install-Docker }
}

$verLabel = if ($Version) { "@$Version" } else { '' }
Ok "done: $Component$verLabel  (log: $LogFile)"
