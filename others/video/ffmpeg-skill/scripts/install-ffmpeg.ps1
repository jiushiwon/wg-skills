# FFmpeg Windows 一键安装脚本
# 优先使用 winget，不可用时从 gyan.dev 下载 release-essentials

$ErrorActionPreference = "Stop"
$FFmpegVersion = "7.1"
$DownloadUrl = "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip"
$InstallDir = "$env:LOCALAPPDATA\ffmpeg"
$TempZip = "$env:TEMP\ffmpeg-essentials.zip"
$TempExtract = "$env:TEMP\ffmpeg-extract"

Write-Host "=== FFmpeg Windows 安装脚本 ===" -ForegroundColor Cyan

try {
    $existing = Get-Command ffmpeg -ErrorAction SilentlyContinue
    if ($existing) {
        Write-Host "[OK] FFmpeg 已安装: $($existing.Source)" -ForegroundColor Green
        ffmpeg -version 2>$null | Select-Object -First 1
        exit 0
    }
} catch { }

# 方式1: winget
$winget = Get-Command winget -ErrorAction SilentlyContinue
if ($winget) {
    Write-Host "[1/2] 检测到 winget，尝试安装 FFmpeg..." -ForegroundColor Yellow
    winget install -e --id Gyan.FFmpeg --accept-source-agreements --accept-package-agreements
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "FFmpeg 安装完成，请关闭当前终端并重新打开后生效。" -ForegroundColor Green
        Write-Host "或直接添加到 PATH: $InstallDir\bin" -ForegroundColor Yellow
        exit 0
    }
    Write-Host "[WARN] winget 安装失败，改用直链下载..." -ForegroundColor Yellow
}

# 方式2: 直链下载
Write-Host "[1/3] 下载 FFmpeg ($DownloadUrl)..." -ForegroundColor Yellow
Invoke-WebRequest -Uri $DownloadUrl -OutFile $TempZip -UseBasicParsing

Write-Host "[2/3] 解压到 $InstallDir..." -ForegroundColor Yellow
if (Test-Path $TempExtract) { Remove-Item -Recurse -Force $TempExtract }
Expand-Archive -Path $TempZip -DestinationPath $TempExtract -Force
$extractedDir = Get-ChildItem -Directory $TempExtract | Select-Object -First 1

if (Test-Path $InstallDir) { Remove-Item -Recurse -Force $InstallDir }
Move-Item -Path $extractedDir.FullName -Destination $InstallDir
Remove-Item $TempZip -Force
Remove-Item -Recurse -Force $TempExtract

Write-Host "[3/3] 验证安装..." -ForegroundColor Yellow
$ffmpegPath = "$InstallDir\bin\ffmpeg.exe"
if (Test-Path $ffmpegPath) {
    & $ffmpegPath -version 2>$null | Select-Object -First 1
    Write-Host ""
    Write-Host "FFmpeg 安装完成" -ForegroundColor Green
    Write-Host ""
    Write-Host "--- 添加到 PATH（可选）---" -ForegroundColor Yellow
    Write-Host "FFmpeg 已安装到: $InstallDir\bin"
    Write-Host ""
    $choice = Read-Host "是否将 $InstallDir\bin 添加到用户 PATH？(y/n)"
    if ($choice -eq 'y' -or $choice -eq 'Y') {
        $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
        if ($userPath -notlike "*$InstallDir\bin*") {
            [Environment]::SetEnvironmentVariable("Path", "$userPath;$InstallDir\bin", "User")
            Write-Host "[OK] 已添加到用户 PATH" -ForegroundColor Green
        }
        # 立即生效当前会话
        $env:Path = "$env:Path;$InstallDir\bin"
        Write-Host "安装完成。执行 ffmpeg -version 验证。" -ForegroundColor Green
    } else {
        Write-Host "跳过 PATH 设置。请手动添加 $InstallDir\bin 到 PATH。" -ForegroundColor Yellow
    }
} else {
    Write-Host "[ERROR] 安装失败，未找到 ffmpeg.exe" -ForegroundColor Red
    Write-Host "请手动下载: https://www.gyan.dev/ffmpeg/builds/" -ForegroundColor Yellow
    exit 1
}
