param([Parameter(Mandatory=$true)][ValidatePattern('^[A-Za-z0-9:._-]+$')][string]$Serial)
$ErrorActionPreference='Stop'
New-Item -ItemType Directory -Force artifacts | Out-Null
& adb -s $Serial shell screencap -p /sdcard/wg-screen.png
if($LASTEXITCODE -ne 0){throw '截图失败'}
& adb -s $Serial pull /sdcard/wg-screen.png artifacts/home.png
if($LASTEXITCODE -ne 0){throw '下载截图失败'}
& adb -s $Serial logcat -d | Out-File artifacts/android-log.txt -Encoding utf8
if($LASTEXITCODE -ne 0){throw '日志失败'}
Write-Host '日志发布前脱敏。录屏：adb -s SERIAL shell screenrecord --time-limit 30 /sdcard/wg-record.mp4；结束后 adb pull。'
