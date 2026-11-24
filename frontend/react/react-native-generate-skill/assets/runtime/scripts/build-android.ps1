param([Parameter(Mandatory=$true)][ValidateSet('test','prod')][string]$Environment,[ValidateSet('apk','aab')][string]$Format='apk')
$ErrorActionPreference='Stop'
node -e "import('./scripts/env.mjs').then(m=>m.prepare(process.argv[1]))" $Environment
if($LASTEXITCODE -ne 0){throw '环境生成失败'}
foreach($name in @('RN_STORE_FILE','RN_KEY_ALIAS')) {if(-not [Environment]::GetEnvironmentVariable($name)){throw "缺少 $name"}}
if(-not (Test-Path -LiteralPath $env:RN_STORE_FILE -PathType Leaf)){throw '签名文件不存在'}
$old=@{}
try {
 foreach($name in @('RN_STORE_PASSWORD','RN_KEY_PASSWORD')) {
  $old[$name]=[Environment]::GetEnvironmentVariable($name)
  if(-not $old[$name]) {
   $secure=Read-Host "$name" -AsSecureString
   $ptr=[Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
   try {[Environment]::SetEnvironmentVariable($name,[Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr),'Process')} finally {[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)}
  }
 }
 Push-Location android
 try {
  $task=if($Format -eq 'aab'){'bundleRelease'}else{'assembleRelease'}
  if($IsLinux -or $IsMacOS){ & ./gradlew $task "-PappEnvironment=$Environment" }else{ & ./gradlew.bat $task "-PappEnvironment=$Environment" }
  if($LASTEXITCODE -ne 0){throw 'Android 打包失败'}
 } finally {Pop-Location}
 Write-Host '检查 android/app/build/outputs，核对包名、签名与实际接口环境后再分发。'
} finally {foreach($name in $old.Keys){[Environment]::SetEnvironmentVariable($name,$old[$name],'Process')}}
