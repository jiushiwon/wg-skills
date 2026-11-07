#!/usr/bin/env bash
#
# install.sh — 在 Linux 服务器上幂等安装部署所需运行时
#
# 用法：
#   ./install.sh <component> [--version X] [--yes]
#
# component: jdk | node | python | go | nginx | docker
# 示例：
#   ./install.sh jdk --version 17
#   ./install.sh node --version 22
#   ./install.sh nginx
#
# 规范：见 deploy-native-skill/references/script-standards.md
# 安全：本脚本只安装服务，不执行数据库初始化；curl|sh 类会打印 WARN 提示审计。
#
set -euo pipefail

# ---------- 默认值 ----------
APP_NAME="${APP_NAME:-deploy}"
LOG_DIR="${LOG_DIR:-/var/log/${APP_NAME}}"
ASSUME_YES=0
VERSION=""

# ---------- 日志函数（自包含，见 script-standards.md）----------
mkdir -p "$LOG_DIR"
LOG_FILE="${LOG_DIR}/$(basename "$0" .sh).log"
_ts() { date '+%Y-%m-%d %H:%M:%S'; }
log()  { local lvl="$1"; shift; printf '[%s] [%s] %s\n' "$(_ts)" "$lvl" "$*" | tee -a "$LOG_FILE"; }
info() { log INFO "$@"; }
warn() { log WARN "$@"; }
err()  { log ERROR "$@"; }
ok()   { log OK "$@"; }
die()  { err "$@"; exit 1; }
run()  { info ">> $*"; "$@" >>"$LOG_FILE" 2>&1 || die "command failed: $*"; }

# ---------- 权限与发行版检测 ----------
need_sudo() {
  if [ "$(id -u)" -ne 0 ] && ! command -v sudo >/dev/null 2>&1; then
    die "需要 root 或 sudo 权限"
  fi
}
SUDO=""
[ "$(id -u)" -ne 0 ] && SUDO="sudo"

detect_pm() {
  if [ -f /etc/os-release ]; then
    . /etc/os-release
    case "$ID" in
      ubuntu|debian) echo apt ;;
      centos|rhel|rocky|almalinux|amzn) command -v dnf >/dev/null 2>&1 && echo dnf || echo yum ;;
      alpine) echo apk ;;
      *) die "暂不支持的发行版: $ID（请手动指定安装命令）" ;;
    esac
  else
    die "无法识别 Linux 发行版（缺少 /etc/os-release）"
  fi
}

have() { command -v "$1" >/dev/null 2>&1; }

# ---------- 组件安装 ----------
install_jdk() {
  local ver="${VERSION:-17}"
  if have java && java -version 2>&1 | grep -q "\"${ver}"; then
    ok "JDK ${ver} already installed, skip"; return 0
  fi
  info "installing OpenJDK ${ver} (pm=${PM})"
  case "$PM" in
    apt)  run $SUDO apt-get update; run $SUDO apt-get install -y "openjdk-${ver}-jdk" ;;
    dnf)  run $SUDO dnf install -y "java-${ver}-openjdk-devel" ;;
    yum)  run $SUDO yum install -y "java-${ver}-openjdk-devel" ;;
    apk)  run $SUDO apk add "openjdk${ver}" ;;
  esac
  java -version 2>&1 | tee -a "$LOG_FILE" && ok "JDK ${ver} installed"
}

install_node() {
  local ver="${VERSION:-22}"
  if have node && [ "$(node -v | cut -d. -f1 | tr -d v)" -ge "$ver" ]; then
    ok "Node.js $(node -v) already installed, skip"; return 0
  fi
  warn "将通过 NodeSource 远程脚本安装，请审计来源：https://github.com/nodesource/distributions"
  info "installing Node.js ${ver} (pm=${PM})"
  case "$PM" in
    apt)
      run bash -c "curl -fsSL https://deb.nodesource.com/setup_${ver}.x | $SUDO -E bash -"
      run $SUDO apt-get install -y nodejs ;;
    dnf|yum)
      run bash -c "curl -fsSL https://rpm.nodesource.com/setup_${ver}.x | $SUDO bash -"
      run $SUDO $PM install -y nodejs ;;
    apk)  run $SUDO apk add "nodejs>=${ver}" npm ;;
  esac
  node -v | tee -a "$LOG_FILE" && ok "Node.js $(node -v) installed"
}

install_python() {
  local ver="${VERSION:-3.11}"
  if have python3 && python3 -V 2>&1 | grep -q "${ver}"; then
    ok "Python ${ver} already installed, skip"; return 0
  fi
  info "installing Python ${ver} (pm=${PM})"
  case "$PM" in
    apt)
      run $SUDO apt-get update
      run $SUDO apt-get install -y "python${ver}" "python${ver}-venv" python3-pip || \
        { warn "默认源无 python${ver}，尝试 deadsnakes PPA"; run $SUDO apt-get install -y software-properties-common; run $SUDO add-apt-repository -y ppa:deadsnakes/ppa; run $SUDO apt-get update; run $SUDO apt-get install -y "python${ver}" "python${ver}-venv"; } ;;
    dnf)  run $SUDO dnf install -y "python${ver}" python3-pip ;;
    yum)  run $SUDO yum install -y python3 python3-pip ;;
    apk)  run $SUDO apk add python3 py3-pip ;;
  esac
  python3 -V | tee -a "$LOG_FILE" && ok "Python $(python3 -V) installed"
}

install_go() {
  local ver="${VERSION:-1.22}"
  if have go && go version 2>&1 | grep -q "go${ver}"; then
    ok "Go ${ver} already installed, skip"; return 0
  fi
  warn "将从 go.dev 下载官方 tar.gz 安装到 /usr/local，请审计来源"
  info "installing Go ${ver}"
  local arch; arch="$(uname -m)"
  case "$arch" in
    x86_64) arch=amd64 ;;
    aarch64|arm64) arch=arm64 ;;
    *) die "不支持的架构: $arch" ;;
  esac
  local tarball="go${ver}.linux-${arch}.tar.gz"
  run bash -c "curl -fsSLo /tmp/${tarball} https://go.dev/dl/${tarball}"
  run $SUDO rm -rf /usr/local/go
  run $SUDO tar -C /usr/local -xzf "/tmp/${tarball}"
  if ! grep -q '/usr/local/go/bin' /etc/profile 2>/dev/null; then
    echo 'export PATH=$PATH:/usr/local/go/bin' | $SUDO tee -a /etc/profile >/dev/null
  fi
  export PATH=$PATH:/usr/local/go/bin
  go version | tee -a "$LOG_FILE" && ok "Go $(go version) installed（请重新登录或 source /etc/profile 使 PATH 生效）"
}

install_nginx() {
  if have nginx; then ok "Nginx $(nginx -v 2>&1) already installed, skip"; return 0; fi
  info "installing Nginx (pm=${PM})"
  case "$PM" in
    apt) run $SUDO apt-get update; run $SUDO apt-get install -y nginx ;;
    dnf) run $SUDO dnf install -y nginx ;;
    yum) run $SUDO yum install -y nginx ;;
    apk) run $SUDO apk add nginx ;;
  esac
  run $SUDO systemctl enable --now nginx || warn "systemctl 不可用，请手动启动 nginx"
  nginx -v 2>&1 | tee -a "$LOG_FILE" && ok "Nginx installed"
}

install_docker() {
  if have docker; then ok "Docker $(docker -v) already installed, skip"; return 0; fi
  warn "将通过 get.docker.com 官方脚本安装，请审计来源：https://docs.docker.com/engine/install/"
  info "installing Docker (pm=${PM})"
  case "$PM" in
    apt|dnf|yum)
      run bash -c "curl -fsSL https://get.docker.com | $SUDO sh"
      run $SUDO systemctl enable --now docker
      run $SUDO usermod -aG docker "${SUDO_USER:-$USER}" || true
      ok "Docker installed；当前用户已加入 docker 组，重新登录后免 sudo" ;;
    apk)
      run $SUDO apk add docker docker-cli-compose
      run $SUDO rc-update add docker boot
      run $SUDO service docker start
      ok "Docker installed (Alpine/OpenRC)" ;;
  esac
  docker -v | tee -a "$LOG_FILE"
}

usage() {
  sed -n '2,14p' "$0"
  exit 2
}

# ---------- 参数解析 ----------
[ $# -lt 1 ] && usage
COMPONENT="$1"; shift
while [ $# -gt 0 ]; do
  case "$1" in
    --version|-v) VERSION="$2"; shift 2 ;;
    --yes|-y) ASSUME_YES=1; shift ;;
    -h|--help) usage ;;
    *) die "未知参数: $1" ;;
  esac
done

need_sudo
PM="$(detect_pm)"
info "detected package manager: ${PM}"

case "$COMPONENT" in
  jdk)    install_jdk ;;
  node)   install_node ;;
  python) install_python ;;
  go)     install_go ;;
  nginx)  install_nginx ;;
  docker) install_docker ;;
  *) err "未知组件: $COMPONENT"; usage ;;
esac

ok "done: ${COMPONENT}${VERSION:+@${VERSION}}  (log: ${LOG_FILE})"
