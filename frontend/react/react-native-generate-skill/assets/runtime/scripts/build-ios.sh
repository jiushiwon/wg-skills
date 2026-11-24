#!/usr/bin/env bash
set -euo pipefail
[[ "$(uname)" == Darwin ]] || { echo '本地 iOS 打包需要 macOS'; exit 1; }
environment="${1:-}"
[[ "$environment" == test || "$environment" == prod ]] || exit 1
: "${IOS_WORKSPACE:?需要 workspace 路径}"
: "${IOS_SCHEME:?需要共享 Scheme}"
: "${IOS_EXPORT_OPTIONS:?需要对应环境的 ExportOptions.plist}"
node -e "import('./scripts/env.mjs').then(m=>m.prepare(process.argv[1]))" "$environment"
mkdir -p build/ios
xcodebuild -workspace "$IOS_WORKSPACE" -scheme "$IOS_SCHEME" -configuration Release -destination 'generic/platform=iOS' -archivePath "build/ios/$environment.xcarchive" archive
xcodebuild -exportArchive -archivePath "build/ios/$environment.xcarchive" -exportOptionsPlist "$IOS_EXPORT_OPTIONS" -exportPath "build/ios/$environment"
