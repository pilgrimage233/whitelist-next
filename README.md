# Minecraft 白名单申请系统 (Next.js 重构版)

基于 Next.js 16 + React 19 + shadcn/ui + TypeScript 的白名单申请系统。

## 技术栈

- **Next.js 16** - App Router + React Compiler
- **React 19** - UI 框架
- **TypeScript 5** - 类型安全
- **shadcn/ui** - 基于 Radix UI 的组件库
- **Tailwind CSS 3** - 样式框架
- **Axios** - HTTP 请求
- **SWR** - 数据获取和缓存
- **Zustand** - 状态管理
- **React Hook Form + Zod** - 表单验证
- **next-themes** - 主题切换
- **skinview3d** - Minecraft 皮肤预览
- **Lucide React** - 图标库

## 主要改进

### 性能优化
- ✅ 使用 Next.js Server Components 减少客户端 JS
- ✅ 自动代码分割和懒加载
- ✅ 图片优化
- ✅ 更快的首屏加载

### CSS 优化
- ✅ 使用 Tailwind CSS，避免 CSS 重复
- ✅ 通过 shadcn/ui 统一组件样式
- ✅ 移除复杂的 CSS 嵌套
- ✅ 基于 next-themes 的暗色模式支持

### 代码质量

- ✅ TypeScript 5 类型安全
- ✅ React Compiler 自动优化
- ✅ 更清晰的项目结构
- ✅ 组件化和可复用性
- ✅ React Hook Form + Zod 表单验证
- ✅ 更好的错误处理

## 项目结构

```
whitelist-next/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 首页（白名单申请）
│   ├── members/           # 成员列表页面
│   ├── quiz/              # 问卷页面
│   ├── verify/            # 验证页面
│   ├── change-id/         # 修改 ID 页面
│   ├── login/             # 白名单用户登录
│   ├── profile/           # 个人资料页
│   ├── privacy/           # 隐私设置页
│   ├── server-status/     # 服务器状态页面
│   ├── api/proxy/         # API 代理
│   ├── providers.tsx      # 全局 Provider
│   └── globals.css        # 全局样式
├── lib/                   # 工具库
│   ├── api/               # API 接口封装
│   │   ├── index.ts       # 白名单相关 API
│   │   ├── quiz.ts        # 问卷相关 API
│   │   ├── server.ts      # 服务器状态 API
│   │   ├── changeId.ts    # 修改 ID API
│   │   ├── whitelist.ts   # 白名单管理 API
│   │   └── whitelistUser.ts # 白名单用户登录 API
│   ├── request.ts         # HTTP 请求封装
│   ├── types.ts           # TypeScript 类型定义
│   └── utils.ts           # 工具函数
├── components/            # 可复用组件
│   ├── ui/                # shadcn/ui 组件
│   ├── SkinViewer.tsx     # 皮肤预览组件
│   ├── SkinViewerDialog.tsx  # 皮肤预览对话框
│   └── QuizDetailDialog.tsx  # 答题详情对话框
└── public/                # 静态资源
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 配置环境变量

创建 `.env.local` 文件：

```env
NEXT_PUBLIC_API_URL=https://xxx.xx/prod-api
NEXT_PUBLIC_SECRET_KEY=
NEXT_PUBLIC_QQ_AVATAR_URL=https://q1.qlogo.cn/g
NEXT_PUBLIC_DEFAULT_LOCALE=zh-CN
NEXT_PUBLIC_APP_NAME=Whitelist
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:3000

### 生产构建

```bash
npm run build
npm start
```

## 功能特性

### 已实现
- ✅ 白名单申请表单
- ✅ 白名单修改表单
- ✅ 白名单用户登录
- ✅ 个人资料与密码修改
- ✅ 隐私设置（控制查询信息可见性）
- ✅ 服务器状态展示
- ✅ 成员列表展示
- ✅ 在线状态显示
- ✅ 邮件验证流程
- ✅ 问卷答题系统
- ✅ 暗色模式支持
- ✅ 响应式设计
- ✅ 皮肤预览功能（使用 skinview3d）
- ✅ 答题详情查看

### 待实现（可选）
- ⏳ 国际化支持

## 页面导航

- `/` 首页，白名单申请与服务器状态
- `/members` 成员列表与在线状态
- `/server-status` 服务器状态详情
- `/quiz` 问卷入口
- `/verify` 白名单验证页
- `/change-id` 修改游戏ID（已登录可直接修改）
- `/login` 白名单用户登录/注册
- `/profile` 个人资料、登录记录、修改密码
- `/privacy` 隐私设置（控制成员查询接口可见字段）

## API 接口

### 白名单申请
```
POST /api/v1/apply
```

### 获取白名单成员
```
GET /api/v1/getWhiteList
```

### 获取在线玩家
```
GET /api/v1/getOnlinePlayer
```

### 验证白名单
```
GET /api/v1/verify?code={code}
```

### 获取问卷题目
```
GET /api/v1/getQuestions?code={code}
```

### 提交问卷
```
POST /api/v1/submitQuiz
```

### 获取答题详情
```
GET /api/v1/getQuizDetail/{quizId}
```

### 获取玩家皮肤数据
```
GET /mojang/user/{username}
```

### 获取皮肤纹理
```
GET /mojang/texture?url={textureUrl}
```

### 白名单用户登录

```
POST /api/v1/whitelist-user/sendCode
POST /api/v1/whitelist-user/register
POST /api/v1/whitelist-user/login
GET  /api/v1/whitelist-user/profile
POST /api/v1/whitelist-user/changePassword
GET  /api/v1/whitelist-user/privacy
POST /api/v1/whitelist-user/privacy
```

## 部署

### Vercel（推荐）

1. 推送代码到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量
4. 自动部署

### Docker

```bash
docker build -t whitelist-next .
docker run -p 3000:3000 whitelist-next
```

## License

MIT
