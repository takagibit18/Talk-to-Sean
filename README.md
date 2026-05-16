# GitHub Homepage

基于 Next.js 15 的个人主页项目，聚合展示 GitHub 资料、仓库列表和近一年贡献热力图。

## 启动指令

在项目根目录执行：

```bash
npm install
npm run dev
```

本地访问地址：`http://localhost:3000`

## 生产模式启动

```bash
npm run build
npm start
```

## 环境变量

1. 复制环境变量模板：

```bash
cp .env.example .env.local
```

1. 编辑 `.env.local`：

```env
GITHUB_USERNAME=yourusername
# 可选：用于提高 GitHub API 速率限制
GITHUB_PAT=ghp_xxxxxxxxxxxxxxxxxxxx
```

说明：

- `GITHUB_USERNAME` 必填
- `GITHUB_PAT` 可选，不填也能运行

## 当前功能

- 个人资料卡片（头像、简介、关注数据、社交链接）
- 最近更新仓库网格（语言、Star、Fork、更新时间）
- 近一年贡献热力图（52x7）
- About / Skills / Contact 静态区块
- 深色沉浸式视觉 + 轻量动效

## 技术栈

- Next.js 15 (App Router)
- React 19 + TypeScript
- Tailwind CSS 4
- Framer Motion
- Lucide React

## 项目结构

```text
app/
	layout.tsx               # 全局布局、字体与页面背景
	page.tsx                 # 首页编排与数据渲染
	globals.css              # 全局设计令牌与语义样式
	loading.tsx              # 加载态
	error.tsx                # 错误态
components/
	ProfileCard.tsx          # 个人资料卡片
	RepoGrid.tsx             # 仓库网格
	ContributionHeatmap.tsx  # 贡献热力图
lib/
	github.ts                # GitHub 用户和仓库数据获取
	contributions.ts         # 贡献数据获取
```

## 常用命令

```bash
# 开发
npm run dev

# 构建
npm run build

# 生产启动
npm start

# Lint
npm run lint
```

## 部署说明

推荐部署到 Vercel：

1. 将仓库连接到 Vercel
2. 在 Vercel 项目环境变量中设置 `GITHUB_USERNAME`
3. 按需设置 `GITHUB_PAT`
4. 触发部署

国内域名 + 阿里云低成本部署方案见：[DEPLOY_ALIYUN.md](DEPLOY_ALIYUN.md)

## API 速率限制

GitHub 未认证请求默认速率限制为每小时 60 次（按 IP）。
配置 `GITHUB_PAT` 后可提升到每小时 5000 次。