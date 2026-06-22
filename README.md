这是一个基于 Vue 3 + Express + MySQL 的前后端分离项目。前端主要负责浏览器页面、表单交互与 UI 展示，后端主要负责接口提供、用户鉴权、数据库读写及文件上传。

## 技术栈

**前端 (frontend/)**

- Vue 3 (前端框架)
    
- Vite (构建工具与开发服务器)
    
- Element Plus (UI 组件库)
    
- Vue Router (前端路由)
    
- Axios (接口请求)
    

**后端 (backend/)**

- Node.js + Express (Web 框架)
    
- MySQL 2 (数据库)
    
- JWT (JSON Web Token 鉴权)
    
- Multer (文件上传处理)
    
- Bcrypt.js (密码加密)
    

## 目录结构与核心模块

**总体架构** 项目分为前端和后端两个独立目录，通过 HTTP 接口进行数据交互。

Plaintext

```
QuestionnaireCollection_MiniWebsite/
├── frontend/        前端 Vue3 项目
├── backend/         后端 Express + MySQL 项目
└── .gitignore       Git 忽略规则
```

**前端目录 (frontend/)**

- `src/main.js`：前端启动入口，负责挂载 Vue 应用、引入路由和组件库。
    
- `src/router.js`：前端路由控制。包含拦截逻辑，未登录用户会被重定向至登录页。
    
- `src/api.js`：统一封装 Axios 请求，自动在请求头携带 `Authorization: Bearer token`。
    
- `src/views/AuthPage.vue`：登录与注册页面（包含手机号注册、密码校验）。
    
- `src/views/HomePage.vue`：项目核心页面。包含个人信息表单填写、头像/简历上传、标签系统管理以及社区成员列表展示。
    
- `vite.config.js`：Vite 配置，包含开发环境下的后端接口代理设置。
    

**后端目录 (backend/)**

- `src/index.js`：后端入口文件，负责启动 Express、配置 CORS、挂载路由与开放静态文件目录。
    
- `src/db.js`：数据库连接池，通过读取环境变量连接 MySQL。
    
- `src/middleware/auth.js`：鉴权中间件，校验请求头中的 JWT token。
    
- `src/middleware/upload.js`：文件上传中间件，处理头像（JPG/PNG）与简历（PDF）的上传及限制。
    
- `src/routes/`：核心业务接口。包含认证 (`auth.js`)、用户资料 (`users.js`)、标签系统 (`tags.js`) 与交流话题 (`topics.js`)。
    
- `src/scripts/`：包含数据库初始化脚本 (`initDb.js`) 与后续字段更新的迁移脚本 (`migrate.js`)。
    

## 本地开发与快速启动

**1. 准备工作** 克隆项目到本地后，请确保系统已安装 Node.js 和 MySQL。

**2. 数据库初始化** 在 `backend` 目录下创建 `.env` 文件并配置数据库连接信息。随后执行初始化脚本：

Bash

```
cd backend
node src/scripts/initDb.js
```

**3. 启动后端服务**

Bash

```
cd backend
npm install
npm start
```

后端服务默认监听在配置文件指定的端口，并提供 `/api/...` 接口。

**4. 启动前端服务** 打开一个新的终端窗口：

Bash

```
cd frontend
npm install
npm run dev
```

前端启动后，所有 `/api` 开头的请求会被 Vite 自动代理到后端服务。

## 生产环境部署

项目采用 Nginx + PM2 进行正式部署。

**前端构建** 在服务器端拉取代码后，进入前端目录进行打包，生成的 `dist` 文件夹交由 Nginx 托管。

Bash

```
cd frontend
npm install
npm run build
```

**后端运行** 使用 PM2 守护后端进程，确保服务持续运行。

Bash

```
cd backend
npm install
pm2 start src/index.js --name yuejie-backend
```

**Nginx 路由转发规则**

- `/` -> 指向 `frontend/dist`
    
- `/api` -> 反向代理至后端 Express 服务端口
    
- `/uploads` -> 指向 `backend/uploads`（用于访问用户上传的头像和简历）
    

## Git 提交规范

本项目已配置 `.gitignore`，以下文件与目录不会被提交至代码仓库，需在服务器端生成或手动配置：

- `node_modules/` (依赖包)
    
- `frontend/dist/` (前端构建产物)
    
- `.env` (包含数据库密码与 JWT 密钥的环境变量文件)
    
- `backend/uploads/` (用户上传的运行时数据)
    
- `*.log` (运行日志)
  
