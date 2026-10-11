# electron-react-skill

基于 electron-vite + React + TypeScript 的桌面应用开发技能。

## 快速开始

```bash
npm create @electron-vite/create@latest my-app -- --template react-ts
cd my-app
npm install
npm run dev
```

## 目录结构

```
my-app/
├── electron/
│   ├── main/           # 主进程
│   │   ├── index.ts   # 入口
│   │   ├── database.ts
│   │   ├── ssh-session.ts
│   │   └── ipc-handlers.ts
│   └── preload/        # 预加载
│       └── index.ts
├── src/
│   └── renderer/      # React 应用
│       ├── components/
│       ├── hooks/
│       ├── store/
│       ├── lib/
│       ├── styles/
│       ├── App.tsx
│       └── main.tsx
├── electron.vite.config.ts
└── package.json
```

## 参考项目

- [super-shell](https://github.com/super-shell/super-shell) - 跨平台数据库/SSH/SFTP 客户端
