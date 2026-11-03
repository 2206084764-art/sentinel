# Sentinel Global Launch Webinar

Sentinel 英文发布会落地页。源项目使用 React + Vite，构建后是可以部署到 GitHub Pages 的静态网站。现阶段日期、时区、主讲人与 Zoom 报名链接尚未确认，页面保留明确的待公布状态，不使用 DS100 旧活动的报名入口。

## 文件怎么用

| 文件 / 目录 | 用途 |
| --- | --- |
| `dist/` | 已构建的静态成品，部署时无需 Node.js |
| `public/event-config.js` | 源项目的活动信息与 Tracking 配置 |
| `dist/event-config.js` | 成品中的活动配置，可直接编辑后上传 |
| `src/`、`index.html` | 页面内容、组件、样式与源 HTML |
| `public/assets/`、`public/docs/` | 本地视频、图片、3D、资料文件 |
| `licenses/`、`THIRD-PARTY-NOTICES.md` | 组件、字体与依赖许可说明，发布时保留 |
| `.github/workflows/pages.yml` | GitHub Pages 自动构建部署流程 |
| `scripts/check-build.mjs` | 构建产物与资源完整性检查 |

## 先预览

在电脑安装 Node.js 22 → 打开终端 → 进入这个 `Landing Page` 文件夹 → 依次运行：

```sh
npm ci
npm test
npm run build
npm run check
npm run preview
```

打开终端显示的本地地址。不要双击 `index.html`：源项目需要 Vite，构建成品中的 ES modules 与 3D 模型也应通过 HTTP/HTTPS 加载。

如只预览成品且电脑已有 Python 3：在 `Landing Page` 目录运行 `python3 -m http.server 8080 --directory dist`，打开 `http://localhost:8080`。

## 发布路径 A：GitHub Pages Actions（推荐）

1. 打开 GitHub → 新建用于 Sentinel 网站的仓库。将 **`Landing Page` 文件夹里面的内容** 上传至仓库根目录，而不是再套一层 `Landing Page/`。
2. 上传源文件、`public/`、`src/`、`tests/`、`scripts/`、`licenses/`、`package.json`、`package-lock.json`、`vite.config.js`、`.github/` 等；**不要上传 `node_modules/`**、日志或任何密钥。`dist/` 可保留作交付快照，但 Actions 每次会重新构建。
3. 保留隐藏文件 `.github/workflows/pages.yml` 与 `public/.nojekyll`。Mac Finder 按 `Command + Shift + .` 显示隐藏文件。文件较多时使用 GitHub Desktop 上传整个目录，避免拖拽漏掉子目录。
4. 打开仓库 → **Settings → Pages → Build and deployment → Source** → 选择 **GitHub Actions**。
5. 将文件提交到 `main` 分支 → 打开 **Actions → Deploy Sentinel to GitHub Pages**。流程依次执行安装、单元测试、构建、资源检查，再部署 `dist/`。
6. 等待流程成功 → 从部署任务的 `github-pages` 链接打开网站 → 验证视频、3D、轮播、下载与报名状态。构建失败时先看红色步骤日志，不要跳过检查。

项目使用相对资源路径 `base: './'`，支持 GitHub Pages 的仓库子路径。不要把路径批量改成以 `/assets/` 开头。

仓库是否能以私有状态使用 Pages，取决于账户/组织设置；请在上传含客户资料的公开仓库前确认素材可公开。

## 发布路径 B：只上传静态成品

1. 确认 `dist/` 已生成且已运行 `npm run check`。
2. 新建一个静态网站仓库 → 将 **`dist/` 内所有内容** 上传到 `main` 分支根目录，使仓库根目录直接出现 `index.html`、`event-config.js`、`assets/`、`docs/`。**保留隐藏的 `.nojekyll`**，不要只上传 `dist` 文件夹本身。
3. 打开仓库 → **Settings → Pages → Source → Deploy from a branch** → Branch 选择 **main**，Folder 选择 **/(root)** → **Save**。
4. 等待 Pages 提供网站地址 → 打开并检查。此路径不需要 `node_modules`、`src` 或 Actions 工作流，也不需要在 GitHub 安装 Node.js。

两条发布路径选择一条即可。不要在同一仓库同时混用源码首页与成品首页。

## 确认活动后改哪里

打开 `public/event-config.js` → 找到 `window.SENTINEL_EVENT` → 修改下列字段 → 保存 → 重新执行 `npm run build` 和 `npm run check` → 上传或提交：

| 字段 | 填写内容 |
| --- | --- |
| `title` | 活动名称 |
| `dateLabel` / `timeLabel` | 页面展示的英文日期、时间与时区 |
| `startISO` / `endISO` | 确认后的 ISO 8601 时间，必须包含 `Z` 或时区偏移；结束时间晚于开始时间 |
| `zoomUrl` | 真实公开 Zoom 报名链接；不是 Host 链接，不是 API Secret |
| `replayUrl` | 活动结束后可用的 HTTPS 回放地址，未准备好保持空字符串 |
| `speakers` | 数组：每位包含 `name`、`role`、`image`；照片放入 `public/assets/` |
| `siteUrl` | 发布后确认的完整网站地址，用于 canonical 等元信息 |
| `contactUrl` | Streamax 联系入口，默认保留现有官方链接 |
| `analytics` | 经授权启用的 GA4、GTM、LinkedIn 配置 |

如果选择静态成品路径，可以直接修改仓库中的 `event-config.js` 或本地 `dist/event-config.js`，**无需重新构建**。但务必将同样内容同步回 `public/event-config.js`；下一次构建会用源配置覆盖成品配置。

没有确认的信息继续留空。日期显示文案和机器时间需要一起更新，不能只改 `dateLabel`。不要填入虚假的主讲人姓名、示例 Zoom 链接或未经确认的时间。

## Tracking 与报名边界

页面保留 UTM 参数与来源信息，并向 `window.dataLayer` 写入交互事件。默认不填 GA4/GTM ID，LinkedIn 也保持关闭；写入本地 `dataLayer` 不等于数据已经传到分析平台。

启用前先确认组织的隐私、Cookie 同意及地区要求。GTM 和直接 GA4 二选一：使用 GTM 时在 GTM 中配置对应标签与触发器，不要重复加载 GA4。不要将 OAuth token、Zoom API key 或任何服务端密钥写入静态文件。

验证方法：打开带 `?utm_source=qa&utm_medium=test&utm_campaign=sentinel_launch` 的网址 → 打开浏览器开发者工具 → 点击 CTA/播放视频/下载资料 → 在 Console 查看 `window.dataLayer` → 确认单次操作只有一条预期事件且保留来源。启用平台后再在 GTM Preview / GA4 DebugView / LinkedIn 检查工具验证实际接收。

Zoom 外链点击仅代表访问报名入口，不能当作已经成功报名；本静态站没有 Zoom 服务端注册回调或 CRM 同步。

## 发布前核对

- 日期、时区、主讲人、报名与回放地址均已确认；活动未确认时仍展示待公布状态。
- Desktop / Mobile 下导航、滚动视频、轮播、夜视对比滑块、3D、键盘操作与减少动态效果偏好符合预期。
- 在 GitHub Pages 实际子路径访问，Network 无缺失文件；四份资料均可下载。3D 需要 WebGL，不支持时应保留产品图片。
- 公开素材授权已获确认：包含新闻画面、客户实拍、人像、车牌、GPS 信息、合作伙伴海报与品牌标识。
- 产品规格、测试条件、试点案例及数据口径经过产品/法务/市场负责人确认；单个客户案例不能作为所有客户的保证。
- 保留第三方许可文件。本包是实际 Sentinel 网站，不是可再分发的通用落地页模板或组件库。

`npm test` 检查业务逻辑，`npm run check` 检查静态产物与素材；两者不代替浏览器视觉、无障碍、真实 Zoom 报名和线上数据接收测试。此文档不表示已经执行 GitHub 发布或全部浏览器 QA。
