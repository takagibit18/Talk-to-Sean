# 阿里云部署指南（OSS 静态托管 + CDN）

本指南用于将当前 Next.js 个人主页部署到国内可访问域名。当前选择的部署方案是：

- 构建期拉取 GitHub 数据，并固化到静态页面。
- 使用 `next build` 导出 `out/` 静态产物。
- 将 `out/` 上传到阿里云 OSS。
- 使用阿里云 CDN 提供加速与 HTTPS。
- 网站底部展示 ICP 备案号与公安备案号。

该方案不需要 ECS 长期运行 Node.js 服务，成本低，维护简单，适合个人主页、简历页、项目展示页。

## 1. 当前前提

你已经完成：

1. 域名购买。
2. 域名实名认证。
3. ICP 备案。
4. 公安备案。
5. 服务器或云资源准备。

本项目实际采用 OSS + CDN 静态托管时，服务器不是必需项。除非后续需要实时接口、数据库、登录、后台任务等服务端能力，否则不建议为了个人主页单独维护 ECS。

## 2. 部署架构

访问链路：

```text
用户浏览器
  -> 域名 DNS
  -> 阿里云 CDN
  -> 阿里云 OSS Bucket
  -> out/ 静态文件
```

数据生成链路：

```text
本地 npm run build
  -> 构建期请求 GitHub API / contribution API
  -> 生成静态 HTML、JS、CSS、图片资源
  -> 输出 out/
```

这意味着线上网站不会在用户访问时实时请求 GitHub。GitHub 数据会固定为最近一次构建时的数据。以后想更新 GitHub 仓库、头像、贡献热力图等信息，只需要重新构建并发布一次。

## 3. 项目静态导出配置

### 3.1 Next.js 配置

确认 `next.config.ts` 使用静态导出：

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

说明：

1. `output: "export"` 会让 Next.js 输出纯静态文件到 `out/`。
2. `images.unoptimized: true` 是静态导出场景下使用 `next/image` 的必要配置之一。
3. 静态导出后不能依赖 `next start`，也不能依赖服务端运行时能力。

### 3.2 GitHub 数据固化策略

本项目选择“构建期拉取数据并固化到页面”。也就是：

1. `npm run build` 时请求 GitHub API 和贡献热力图 API。
2. 请求结果写入静态页面产物。
3. 用户访问线上网站时，只读取 OSS/CDN 上的静态文件，不再实时请求 GitHub。

当前页面在 `app/page.tsx` 中调用：

```ts
getGitHubUser()
getGitHubRepos(6)
getContributions()
```

因此需要把 `lib/github.ts` 和 `lib/contributions.ts` 改成纯构建期请求。

#### 3.2.1 修改 `lib/github.ts`

把 `getGitHubUser()` 中的请求配置从：

```ts
{
  headers: getHeaders(),
  next: { revalidate: 3600 },
}
```

改为：

```ts
{
  headers: getHeaders(),
  cache: "force-cache",
}
```

把 `getGitHubRepos()` 中的请求配置也从：

```ts
{
  headers: getHeaders(),
  next: { revalidate: 3600 },
}
```

改为：

```ts
{
  headers: getHeaders(),
  cache: "force-cache",
}
```

#### 3.2.2 修改 `lib/contributions.ts`

把贡献热力图请求从：

```ts
{ next: { revalidate: 86400 } }
```

改为：

```ts
{ cache: "force-cache" }
```

#### 3.2.3 构建环境变量

如果你需要指定 GitHub 用户名或提高 GitHub API 限额，在 `.env.local` 中配置：

```env
GITHUB_USERNAME=你的 GitHub 用户名
GITHUB_PAT=你的 GitHub Token
```

注意：

1. `GITHUB_PAT` 只在构建时使用，不要提交到 Git。
2. 不要使用 `NEXT_PUBLIC_` 前缀，否则变量会暴露到浏览器端。
3. 每次想更新 GitHub 数据，都需要重新执行 `npm run build`，再上传新的 `out/` 并刷新 CDN。

## 4. 上线前内容检查

在构建前确认以下内容已经写入项目。

### 4.1 简历 PDF

下载简历按钮指向：

```text
/cv.pdf
```

因此简历文件应放在：

```text
public/cv.pdf
```

部署后访问地址为：

```text
https://你的域名/cv.pdf
```

### 4.2 公安备案图标

公安备案图标应放在：

```text
public/beian-icon.png
```

部署后页面引用路径为：

```text
/beian-icon.png
```

### 4.3 备案号展示

网站底部需要展示：

1. ICP 备案号，并链接到 `https://beian.miit.gov.cn/`。
2. 公安备案号，并在编号前展示公安备案图标。

公安备案链接示例：

```html
<a
  href="https://beian.mps.gov.cn/#/query/webSearch?code=32081202000685"
  rel="noreferrer"
  target="_blank"
>
  苏公网安备32081202000685号
</a>
```

## 5. 本地构建

在项目根目录执行：

```bash
npm install
npm run build
```

构建成功后应生成：

```text
out/
```

检查 `out/` 根目录中至少包含：

```text
index.html
404.html
_next/
cv.pdf
beian-icon.png
```

如果 `cv.pdf` 或 `beian-icon.png` 缺失，优先检查它们是否位于 `public/` 目录。

## 6. 本地预览

可以用静态文件服务器预览：

```bash
npx serve out
```

重点检查：

1. 首页是否正常打开。
2. GitHub 用户信息、仓库列表、贡献热力图是否显示。
3. “Download CV / 下载简历” 是否打开 `/cv.pdf`。
4. 底部 ICP 备案号和公安备案号是否显示。
5. 公安备案图标是否出现在公安备案号前面。
6. 浏览器控制台是否有资源 404。

## 7. 创建 OSS Bucket

路径：

```text
阿里云控制台 -> 对象存储 OSS -> Bucket 列表 -> 创建 Bucket
```

建议配置：

1. 地域：选择靠近主要访客的中国内地区域。
2. 存储类型：标准存储。
3. 读写权限：公共读。
4. 版本控制：个人主页可先不开。
5. 服务端加密：按默认即可。

创建后进入 Bucket：

```text
基础设置 -> 静态页面
```

配置：

```text
静态网站托管：开启
默认首页：index.html
默认 404 页：404.html
```

## 8. 上传静态产物到 OSS

上传的是 `out/` 目录里的内容，不是项目源码，也不是整个 `out` 文件夹。

上传后 OSS Bucket 根目录应类似：

```text
index.html
404.html
_next/
cv.pdf
beian-icon.png
avatar-warm-portrait.png
wechat-qr.png
...
```

可以通过 OSS 控制台上传，也可以使用 `ossutil`：

```bash
ossutil cp -r out/ oss://你的-bucket-name/ --update
```

上传完成后，先使用 OSS 静态网站地址访问一次，确认页面能打开。

## 9. 接入 CDN

路径：

```text
阿里云控制台 -> CDN -> 域名管理 -> 添加域名
```

建议配置：

1. 加速域名：`www.你的域名`。
2. 业务类型：静态加速。
3. 源站类型：OSS 域名。
4. 源站地址：选择你的 OSS Bucket 外网域名。
5. 回源 Host：按控制台推荐，通常与 OSS 源站域名保持一致。
6. 加速区域：中国内地。

注意：CDN 加速区域包含中国内地时，加速域名必须完成 ICP 备案。你已经完成备案，可以继续接入。

## 10. 配置 HTTPS

进入 CDN 域名配置：

```text
CDN -> 域名管理 -> 你的域名 -> HTTPS 配置
```

配置：

1. 申请免费 SSL 证书，或上传已有证书。
2. 开启 HTTPS。
3. 开启 HTTP 强制跳转 HTTPS。
4. 可选：开启 HTTP/2。
5. 可选：开启 Gzip 或 Brotli 压缩。

等待证书状态正常后，再继续 DNS 解析。

## 11. 配置 DNS 解析

进入：

```text
阿里云控制台 -> 云解析 DNS -> 你的域名 -> 解析设置
```

添加 `www` 解析：

```text
记录类型：CNAME
主机记录：www
记录值：CDN 分配的 CNAME
TTL：默认
```

如果还要支持裸域名：

```text
yourdomain.com
```

可以给 `@` 也配置到 CDN，或将裸域名 301 跳转到 `www`。建议先确保 `www.你的域名` 稳定可访问，再处理裸域名。

## 12. CDN 缓存规则

推荐缓存策略：

```text
*.html：5-10 分钟
/_next/static/*：7-30 天
*.js / *.css：7-30 天
*.png / *.jpg / *.webp / *.svg / *.ico / *.pdf：7-30 天
```

说明：

1. HTML 短缓存，方便发布后较快生效。
2. Next.js 静态资源通常带 hash，适合长缓存。
3. PDF 如果会频繁更新，发布新简历后需要刷新 `/cv.pdf`。

## 13. 后续发布流程

每次更新网站内容后：

```bash
npm run build
```

然后：

1. 上传新的 `out/` 内容到 OSS 根目录。
2. 覆盖旧文件。
3. 在 CDN 控制台刷新缓存。

建议刷新：

```text
https://www.你的域名/
https://www.你的域名/index.html
https://www.你的域名/cv.pdf
```

如果改动了大量静态资源，可以刷新目录：

```text
https://www.你的域名/
```

## 14. 最终验证清单

上线后逐项确认：

1. `https://www.你的域名` 可以正常访问首页。
2. `http://www.你的域名` 会跳转到 HTTPS。
3. 浏览器证书正常。
4. 首页无明显样式错乱。
5. 图片、头像、二维码、备案图标无 404。
6. `/cv.pdf` 可以打开。
7. GitHub 仓库和贡献热力图显示的是最近一次构建时的数据。
8. ICP 备案号显示并能跳转到工信部备案系统。
9. 公安备案号显示，图标在编号前，并能跳转到公安备案查询页。
10. 手机端和桌面端布局正常。

Windows 下可用：

```powershell
nslookup www.你的域名
Invoke-WebRequest https://www.你的域名
```

## 15. 常见问题

### Q1：为什么 GitHub 数据不是实时更新？

因为当前方案选择的是静态托管。GitHub 数据会在 `npm run build` 时拉取并固化到页面中。用户访问线上网站时，OSS/CDN 只返回静态文件，不运行 Node.js 服务。

### Q2：如何更新 GitHub 数据？

重新执行：

```bash
npm run build
```

再上传新的 `out/` 到 OSS，并刷新 CDN。

### Q3：什么时候需要 ECS？

如果你需要以下能力，再考虑 ECS、函数计算或其他服务端方案：

1. 用户访问时实时请求 GitHub。
2. 登录、权限、后台管理。
3. 数据库读写。
4. Webhook 自动更新。
5. 定时任务。
6. 服务端 API。

当前个人主页不需要 ECS。

### Q4：备案号必须在静态导出前加入吗？

是。备案号和备案图标需要先写进项目，再执行 `npm run build`。否则生成的 `out/` 里不会包含备案展示。

### Q5：上传后页面还是旧版本怎么办？

通常是 CDN 缓存未刷新。处理顺序：

1. 确认 OSS 中的文件已经更新。
2. 刷新 CDN 首页 URL。
3. 刷新 `index.html`。
4. 浏览器强制刷新或使用无痕窗口访问。
