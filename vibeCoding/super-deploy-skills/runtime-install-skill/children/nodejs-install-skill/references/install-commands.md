# Node.js 安装命令参考

## Ubuntu/Debian

### Nodesource 仓库安装

```bash
# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Node.js 16
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs
```

### 验证安装

```bash
node -v
npm -v
```

## CentOS/RHEL

### Nodesource 仓库安装

```bash
# Node.js 20
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash
sudo dnf install -y nodejs

# Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash
sudo dnf install -y nodejs
```

### 清理旧版本

```bash
# 清理旧节点模块和包
rm -rf /usr/local/lib/node_modules
rm -rf /usr/local/bin/npm
rm -rf /usr/local/bin/node

# 清理 yum 缓存
sudo yum clean all
```

## macOS

### Homebrew 安装

```bash
# 安装 Node.js 20
brew install node@20

# 安装 Node.js 18
brew install node@18

# 链接
brew link node@20
```

### 验证

```bash
node -v
npm -v
```

## Windows

### winget 安装

```powershell
# Node.js 20 LTS
winget install NodeJS.NodeJS.20.0.0

# 或
winget install OpenJS.NodeJS.LTS
```

### 验证

```powershell
node -v
npm -v
```

### Chocolatey 安装

```powershell
choco install nodejs-lts
```

## Docker 方式

### 拉取镜像

```bash
# LTS 版本
docker pull node:20

# 特定版本
docker pull node:18

# Alpine 轻量镜像
docker pull node:20-alpine
```

### 运行

```bash
# 交互式
docker run -it node:20 /bin/bash

# 运行 npm 脚本
docker run -v /path/to/project:/project node:20 sh -c "cd /project && npm install && npm run build"
```

### Docker Compose

```yaml
version: '3.8'
services:
  node-app:
    image: node:20-alpine
    volumes:
      - ./app:/app
    working_dir: /app
    command: npm start
    ports:
      - "3000:3000"
```

## nvm（Node Version Manager）

### 安装 nvm

```bash
# curl 安装
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# wget 安装
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

### 使用 nvm 安装 Node.js

```bash
# 激活 nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 安装 LTS 版本
nvm install 20
nvm install 18

# 使用指定版本
nvm use 20

# 设置默认版本
nvm alias default 20

# 列出已安装版本
nvm ls
```

## npm 配置

### 换源（国内）

```bash
# 淘宝源
npm config set registry https://registry.npmmirror.com

# 恢复官方源
npm config set registry https://registry.npmjs.org/
```

### 全局安装路径

```bash
# 查看当前配置
npm config get prefix

# 设置全局安装到用户目录
npm config set prefix '~/.npm-global'
export PATH="$HOME/.npm-global/bin:$PATH"
```

### 安装常用工具

```bash
# 安装 yarn
npm install -g yarn

# 安装 pnpm
npm install -g pnpm

# 安装 pm2
npm install -g pm2

# 安装 typescript
npm install -g typescript
```

## 卸载命令

### Ubuntu/Debian

```bash
# 移除 Node.js
sudo apt remove --purge -y nodejs

# 移除 Nodesource 仓库
sudo rm -rf /etc/apt/sources.list.d/nodesource.list
sudo apt clean
```

### CentOS/RHEL

```bash
sudo dnf remove -y nodejs
sudo rm -f /etc/yum.repos.d/nodesource-*.repo
```

### macOS

```bash
brew uninstall node@20
```

## 常见问题

### Q: npm 权限问题

A: 不要用 sudo npm，使用 npm 配置 prefix 到用户目录

### Q: nvm command not found

A: 在 ~/.bashrc 或 ~/.zshrc 中添加：
```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

### Q: node-gyp 编译失败

A: 安装编译工具：
```bash
# Ubuntu
sudo apt install -y build-essential python3

# CentOS
sudo dnf groupinstall -y "Development Tools"
```

### Q: 端口被占用

A: 查看占用进程：`lsof -i :3000` 或 `netstat -tlnp | grep 3000`
