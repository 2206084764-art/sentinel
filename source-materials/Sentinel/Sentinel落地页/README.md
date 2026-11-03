# Sentinel Webinar Landing Page

This is a standalone Sentinel landing page copied from `Sentinel废稿`, with its runtime resources consolidated under `assets/`.

- Double-click `index.html` to preview it locally, or deploy the `Landing Page` folder directly.
- The page structure, styles and interaction code are contained in `index.html`; `assets/` contains media, fonts and 3D scenes. Internal technical documents are stored outside this website directory and are not included in public assets.
- The event configuration is kept at the top of `index.html`; fill in confirmed webinar details and the public Zoom URL there when available.
- The page and its retained 3D assets use locally bundled HarmonyOS Sans fonts, including the official navigation, footer, dialogs and controls. No system font installation is needed.
- HarmonyOS Sans Fonts: Copyright 2021 Huawei Device Co., Ltd. Original font files and license are bundled in `assets/fonts/`; shared font styles are in `assets/fonts/harmonyos.css`.
- 已移除首屏章节总数及 Guardian / AI / Night Vision / Technology / Field 的六处装饰性编号标签，直接从页面结构删除；正文标题、AI 的 Observe / Understand / Respond 交互阶段、Agenda 和媒体浏览计数保留。AI 滚动提示继续靠右，官网导航未修改。
- 标签清理通过 25 项浏览器检查：1440/1280/768/390 下标题和提示对齐、无横向溢出、六处标签不再出现在 DOM、AI 三阶段滚动和 8 个报名按钮正常，无脚本错误；已核对桌面和手机截图。

## 首屏产品动画

- 首屏右侧使用现有 Sentinel 三维模型逐帧渲染的静音旋转视频：`assets/videos/sentinel-hero-3d.mp4`，960×800 / 60fps / 18 秒，每轮完整旋转一周。
- 封面：`assets/images/sentinel-hero-3d-poster.png`。视频未播放或加载失败时显示此封面。
- 在 `index.html` 搜索 `SENTINEL_HERO_MEDIA` 可替换视频和封面；搜索 `sentinel-hero-film-styles` 可调整这一区域样式。
- 视频循环播放，可手动暂停；离开首屏或切到其他标签页时暂停，并遵循系统“减少动态效果”设置。
- 卡顿修复：旧首屏素材帧间隔不均匀，最长单帧约 265ms；旧地球循环为 24fps。两段现已从原场景分别生成 1080 张独立帧，再编码为固定 60fps H.264；不是对旧视频复制帧。首帧与 18 秒闭合帧像素一致，首尾姿态连续。
- 首屏使用自动预加载并移除视频内层重复的 screen 混合；地球视频临近视口 600px 时提前缓冲，仍只在可见时播放。两段成片合计约 14.8 MB，比原合计约 16.5 MB 小 10%；粒子视频采用更高码率保留运动细节。封面同步更新为真实首帧。
- 素材重建工具：`scripts/render-product-loops.cjs` 使用已有 Playwright 和 Chrome，以固定时间点读取 `assets/3d/sentinel-only.html` 与 `globe-sentinel.html`；`scripts/encode-product-loops.swift` 使用 macOS AVFoundation 编码。它们只用于制作资源，静态页面运行不依赖这些工具，也不修改原始 3D HTML。
- 重建步骤：启动项目 HTTP 服务 → 在具备 Playwright 的 Node 环境执行 `node scripts/render-product-loops.cjs http://127.0.0.1:8768 /tmp/sentinel-product-frames` → 执行 `swift scripts/encode-product-loops.swift /tmp/sentinel-product-frames/hero /tmp/sentinel-hero.mp4 hero` 和 `swift scripts/encode-product-loops.swift /tmp/sentinel-product-frames/globe /tmp/sentinel-globe.mp4 globe` → 核对后替换对应 MP4 与各文件夹的 `0000.png` 封面。输出路径应选择尚不存在的文件。
- 最终版本通过 34 项浏览器检查：真实推进、18 秒循环跨尾、暂停/恢复、离屏停止/返回、1280/768/390 布局、减少动态效果主动播放、file:// 与 HTTP 缓冲播放、失败封面与 8 个报名按钮，无脚本错误；另核对 1440 桌面及 390 手机截图。固定帧时间检查均为 16.67ms。本机 Chrome 2.5 秒采样的平均画面回调间隔：首屏约 36.8→20.2ms，地球约 41.7→19.1ms；回调采样受浏览器合成调度影响，区别于素材编码帧率。官网导航逐字节保持一致，Intro/Product 滚动转场未修改。

## DS100 参考模块移植

- Agenda 与 Join the Launch 的 HTML、最终样式级联、地区地标照片和国旗取自 `DS100 例子/index.html`。参考文件未修改。
- `assets/webinar/reference-sections.js` 保存移植后的模块结构；`ds100-webinar.css` 是只作用于这两块区域的原样式；`sentinel-webinar.js` 处理倒计时、滚动显示和报名点击。
- 图示 Agenda 位于报名区前，原来的 Sentinel 单场次卡片/折叠 Agenda 被这两块替换。
- 全页继续使用本地 HarmonyOS Sans。日期、时区和 Zoom 地址没有复制 DS100 的旧数据，默认保持待公布。
- 编辑报名信息：打开根目录 `index.html` → 找到顶部 `window.SENTINEL_EVENT.sessions` → 按地区填写 `dateLabel/timeLabel/timezone/startISO/endISO/zoomUrl` → 保存并刷新。
- `startISO/endISO` 使用包含时区偏移的 ISO 时间。Zoom 链接只接受原页面已验证的 HTTPS Zoom 官方域名；未配置链接时显示可点击的 `Register Now` 按钮，点击不跳转；填入有效 Zoom 地址后自动启用报名跳转。已结束且无回放的场次仍显示禁用的 `Session Ended`。
- Hero 的 Join the Launch 按钮跳转到地区报名区。报名链接沿用原 UTM 透传和 `webinar_cta_click` 事件，每次点击触发一次。

- 本轮已验证 1440×900、1280×800、768×1024、390×844，照片加载、直接双击 HTML、按钮边界、单/多场次、倒计时、错误链接处理、UTM 与点击事件，共 36 项通过。Zoom 测试请求被拦截，未提交实际报名。

## 3D 场景按章节展示

- 已移除集中选择场景的 Product Lab，下拉框、手动加载入口和对应组件不再出现在页面中。
- A New Kind of Guardian 使用 `assets/videos/globe-sentinel-loop.mp4`：从原 `globe-sentinel.html` 真实模型逐帧生成的 720×720 / 60fps / 18 秒循环，完整呈现地球 → Sentinel → 地球，形态变化采用连续缓动。该处使用原生静音循环视频，避免 WebGL 激活失败后停在静态封面。
- Always-On Video 区域改为 `assets/videos/truck-day-night-turntable.mp4`：从现有 `truck-day-night.html` 真实卡车和 Sentinel 模型渲染的 20 秒、720×480、24fps、360° 日夜环绕视频；原 AOV 演示通过 Watch the AOV demo 打开。
- AOV 视频在 file:// 双击 HTML 和 HTTP 预览中均可自动循环。左右拖动会按 360° 环绕视频的进度切换角度，松手后继续播放；方向键也可切换角度。手机上下滑动继续浏览页面。该处是水平环绕视频，不能任意上下翻转三维模型。减少动态效果时等待手动播放；暂停状态下拖动不会擅自恢复播放。
- 2026-10-21 视频版验证：30 项浏览器检查通过，覆盖 file:// 双击自动播放、20 秒真实循环、鼠标拖动切换画面、松手续播、反向拖动、手动暂停保持、键盘角度切换、HTTP Blob 定位、手机 file:// 触控与上下滚动、1440/1280/768/390 布局、减少动态效果手动播放、离屏暂停/返回恢复、原 AOV 弹窗、8 个报名按钮、失败封面回退，以及鼠标操作无额外焦点边框、键盘切换仍可用。视频约 3.9 MiB，配套封面为 `assets/images/truck-day-night-turntable-poster.png`。
- Connected 已换成营销参考页的完整 IoT Synergies 模块：保留线框、实体、点云、连接脉冲、传感器标签和拖拽交互，见下方 IoT 模块说明。
- `assets/js/contextual-scenes.js` 的 GlobeLoop 管理地球视频；DragVideo 管理 AOV 视频自动循环、拖动定位、暂停、离屏停止与减少动态效果。AOV 视频临近视口才加载；HTTP 使用完整短片 Blob 兼容无 Range 的静态服务，file:// 直接加载本地 MP4。IoT 模块在 `assets/js/iot.js` 中单独管理模型按需加载、视图切换、离屏释放和失败回退。
- `assets/3d/story-status.js` 负责实际模型加载状态；三个 `assets/images/scene-*.png` 封面均为实际模型的浏览器截图。
- 通过本地 HTTP 服务或静态网站部署查看实时 3D：在项目目录运行 `python3 -m http.server 8768` → 浏览器打开 `http://127.0.0.1:8768/`。直接双击 HTML 可播放地球与 Sentinel 循环，也可播放并拖动 AOV 360° 视频；Connected 的三种 3D 视图在 file:// 与 HTTP 中都可使用；WebGL 不可用时显示模型封面。减少动态效果模式不自动播放视频，可点击 Play animation 主动播放。
- 所有模型和 Three.js 依赖继续使用本地 `assets/3d/` 文件；`素材/` 与 `DS100 例子/` 均未修改。

- 2026-10-20 验证：49 项浏览器检查通过，覆盖三场景实际循环、单场景激活、暂停/恢复、离屏释放、1440/1280/768/390 布局、减少动态效果、直接打开 HTML 和模型加载失败回退。另检查了 AOV 原视频入口、产品角度切换和章节锚点。

- 地球循环修复验证：12 项检查通过，包括自动开始、实际跨越视频末尾继续下一轮、暂停/恢复、离屏暂停与返回恢复、390px 布局、file:// 直接播放和减少动态效果下主动播放。

## Intro / Product 滚动影片转场

- 已阅读 `DS100 例子/index.html` 的 `syncTwoViews`、`installed-base-v34-stable-js` 和 `ds100-mobile-runtime-v1`，复用其 CSS sticky、滚动进度映射视频时间、反向定位与末帧停留的方法。参考文件未修改。
- 两个独立的纯画面转场：Intro 位于 Guardian 与 AI 之间；Product 位于 Installation 与 Technology 之间，Installation 紧接 Night Vision。每处只加载自己的视频，不再拼接时间轴。没有边框、标题、章节标签、进度条或跳过文字。原 Intro 是定帧录像，该处采用较短滚动距离和轻微推进；Product 随滚动展示真实内部结构动画。
- `index.html` 接入 `assets/js/product-film.js` 与 `assets/css/product-film.css`。无新增框架或第三方依赖。
- 原始 `assets/videos/intro.MP4`、`product.MP4` 保持不变。播放副本为 `intro-scroll.mp4` / `product-scroll.mp4`（1440×776，H.264，密集关键帧，合计约 3.4 MB），裁去了原录屏底部的页面说明栏及边框。封面由对应视频提取。
- HTTP 预览会临近视口时一次缓冲短视频，以兼容缺少 HTTP Range 支持的静态预览服务器；file:// 使用本地视频路径。滚动停止时影片暂停，上滚可倒退；最后停留一段滚动距离后正常释放。
- Product 从视频第 1 秒的完整产品画面开始，跳过贴近镜头的开头。进入时先显示黑场，滚动进度 2%–12% 平滑淡入；首个目标帧解码前保持黑场，避免闪出旧封面。反向滚动可退回黑场，Intro 的速度与开场保持不变。Product 静态/失败封面同步采用第 1 秒画面。
- 2026-10-22：Product 桌面/平板的有效滚动距离扩大为原来的 1.5 倍，使相同滚动距离的视频推进量降为原来的三分之二，即速度调慢三分之一。`assets/css/product-film.css` 的章节高度改为 `calc(520svh + var(--film-header) * .5)`，计入 sticky 画面与导航高度后准确延长播放距离。手机保持原有比例文档流布局；Intro 的滚动距离未调整。18 项 Chrome 检查通过：1440/1280/768 下距离比例、实际视频时间增量约 0.6667 倍、黑场渐显、完整末帧、反向播放、停留和 sticky 释放，以及 390 手机布局、减少动态效果和无脚本错误。
- Intro 保留原开头、视频时间映射和轻微推进；桌面/平板的有效滚动距离加倍，使同样滚动速度下的播放速度降为一半。章节高度由 200svh 调为 `calc(300svh + var(--film-header))`，计入固定画面和导航高度后实际播放距离恰好加倍。滚动进度 78%–94% 平滑淡出，结尾保持黑场后释放到 AI 章节。上滚可恢复画面；手机继续保持原比例文档流适配，减少动态效果时继续显示原静态封面。
- 减速验证通过 20 项浏览器检查：1440/1280/768 下实际滚动距离加倍，相同滚动距离的视频时间增量约为原来的 0.5 倍；开头、结尾黑场、反向恢复、Product 时长、390 手机比例和静态回退保持正常，无脚本错误。
- 桌面与平板采用 sticky；手机按视频原比例放入正常文档流，通过进入/离开视口的进度控制影片，避免大块上下留白。系统减少动态效果时分别显示各自的静态封面。正常模式可以快速滚动通过，末帧后自然释放。

- 本次拆分后通过 31 项浏览器检查：独立位置和视频来源、无装饰文字/边框、实际 Product 帧变化、前进/倒退/快速定位、停止保持、末帧释放、1440×900 / 1280×800 / 768×1024 / 390×844、手机原比例布局、减少动态效果、直接打开 index.html、8 个报名按钮与无 JavaScript 错误。导航及其他页面代码与修改前一致。
- Product 开场优化后通过 46 项浏览器检查：1440/1280/768/390 下黑场、渐显、跳过特写、正反向定位与实际帧变化，停止保持、末帧与 sticky 释放，慢加载防闪帧、失败封面及减少动态效果。file:// 与 HTTP 均正常，Intro 和 8 个报名按钮保持原行为，无脚本错误；已核对桌面与手机截图。
- Intro 结尾调整后通过 32 项浏览器检查：1440/1280/768/390 下原开头、原时间映射、结尾淡出与黑场停留、反向恢复、布局与章节释放，以及静态封面、HTTP/file://、Product 原有渐显和报名按钮。无脚本错误，已核对淡出与纯黑结尾截图。


## Alerts 手机通知模块

- 从 `素材/Sentinel Keynote HTML/Sentinel-Marketing.html` 的 Alerts 区块复制实际 HTML、手机 CSS、三条通知内容及重播逻辑，替换原 All-in-One 产品规格/角度切换卡片和下方三张功能卡片。AOV 与 Connected 两块保留。
- `assets/js/alerts.js` 保存原模块结构、进入视口自动播放、按钮/手机点击与 Enter/空格键重播；三条通知延迟仍为 0.05 / 0.55 / 1.15 秒，重播保护仍为 1.9 秒，卸载时清理监听器和计时器。
- `assets/css/alerts.css` 仅作用于 Alerts，沿用原手机造型、尺寸、两栏/单栏断点和动画，颜色改为当前黑色/Streamax 黄绿色，字体继续使用本地 HarmonyOS Sans。内容宽度与左右边距由父级 Technology 章节统一控制，避免重复限宽与双重侧边距。
- 缩略图复用 `assets/images/cases/alert-night.webp`，无新增媒体、外部字体或依赖。根目录 HTML 可直接双击运行；减少动态效果时直接呈现完整通知。
- 原始营销 HTML 未修改，官网 Header、报名配置和追踪逻辑保持不变。

- 本轮通过 36 项浏览器检查：源文案与手机几何尺寸一致、三条通知时序、自动播放一次、按钮/手机/Enter/空格重播、快速点击保护、黑绿配色和本地缩略图、1440/1280/768/390/320 布局与手机内容边界、file:// 和 HTTP、减少动态效果，以及 AOV 视频/弹窗、Connected CTA、8 个报名按钮与无脚本错误；另校准了 1440/390 下 HarmonyOS 字体的标题分行，使其与参考图一致。


## IoT Synergies 模块

- 从 `素材/Sentinel Keynote HTML/Sentinel-Marketing.html` 复制 IoT 的正文、四类传感器、脚注、左右布局、响应式断点和 Wireframe / Solid / Point cloud 三个按钮，替换原 Connected 图片/3D 与 CTA 区域，保留 `#connected` 锚点。
- `assets/js/iot.js` 管理滚动显示、视图按钮、父子页面消息、加载期间的最后选择、离屏/隐藏标签页释放模型和错误封面。`assets/css/iot.css` 保留参考结构并适配黑色/Streamax 黄绿色与 HarmonyOS 字体；内容宽度与 Technology 章节对齐，不另加内层限宽和左右边距，不影响其他模块。
- `assets/3d/marketing-iot.html` 复制原始卡车、Sentinel、四类传感器与连线算法；点云仍实时采样约 17 万个点，传感器浮动标签保留。线框和实体/点云实际切换，支持鼠标拖拽及手机左右旋转，滚轮/手机上下滑动继续浏览页面。
- 为支持双击 HTML，3D 场景内嵌原模型及现有本地 Three.js 的 13 个依赖模块，无需 CDN、服务器或安装新依赖。场景约 20.2 MiB，仅临近模块时加载，离开后释放。`assets/images/iot-marketing-wireframe.png` 是真实模型生成的加载/错误封面。
- 重建三维资源：在项目根目录运行 `python3 scripts/build-iot-scene.py`。脚本读取原始素材及 `assets/3d/vendor/three/`，只生成 assets 中的副本；不修改原始营销 HTML 或 3D 素材。
- 减少动态效果模式默认显示封面；主动点击视图按钮后加载三维，连接脉冲保持静止。原生 AOV、Alerts 手机通知、导航与 Webinar 配置保持不变。

- 本轮通过 37 项浏览器检查：file:// 无 HTTP 依赖、真实线框/实体/169999 点的点云、四类标签与动态连线、GPU 相机矩阵随拖拽变化、1440/1280/768/390/320 适配、手机左右旋转/上下滚动、加载中最后选择保持、离屏释放/返回恢复、减少动态效果主动加载、HTTP、WebGL 失败封面，以及 Alerts/AOV/8 个报名按钮和无脚本错误。
- 后续宽度调整通过 24 项浏览器检查：1920/1440/1280/768/390/320 下 Alerts、IoT 与 Technology 标题左右边界一致，手机与模型无横向溢出；通知重播、三种 3D 视图、模型拖拽及 8 个报名按钮正常，无脚本错误。已核对桌面与手机截图，根目录 HTML 和两个模块的 JavaScript 未改动。

## Installation 安装模块

- 从 `素材/Sentinel Keynote HTML/Sentinel-Marketing.html` 复制 Installation 的标题、正文、三项安装说明、两栏结构、滚动显示及两个独立覆盖范围按钮，放在 Night Vision 图像对比之后、Product 转场之前。原始营销页面及三维素材均未修改。
- `assets/css/installation.css` 将该模块适配为黑色/Streamax 黄绿色与 HarmonyOS 字体；使用现有 `.section` 的内容宽度及边距，内层不再重复限宽。桌面文字在左、模型在右，860px 以下改为上下排列。
- `assets/js/installation.js` 管理按需加载、按钮状态、模型消息、离屏释放和失败封面。Cab-roof unit / Rear unit 初始均开启，可分别切换，也可同时显示；拖拽旋转模型，滚轮和手机上下滑动继续浏览落地页。返回模块时保留选择。
- `assets/3d/marketing-installation.html` 复用原始 `truck-sentinel-mount.html` 的卡车、两台 Sentinel、安装位置光圈与三维覆盖范围；正常模式缓慢旋转并保留原 R/T 快捷键。模型与 6 个本地 Three.js 依赖模块内嵌，约 20.3 MiB，直接双击 HTML 也可使用，不依赖 CDN。仅临近模块时加载，离屏或隐藏页面时释放 WebGL；限制渲染像素比并复用静态阴影。
- `assets/images/installation-mount-poster.png` 为实际模型截图，用作加载/错误封面。减少动态效果模式默认显示封面；主动点击覆盖范围按钮后才加载静止三维场景。
- 重建安装场景：在项目根目录运行 `python3 scripts/build-installation-scene.py`。脚本读取原素材与既有 Three.js，只生成 assets 中的副本，并检查原始模型数据保持一致；页面正常运行无需执行此脚本或安装新依赖。
- 2026-10-22 通过 36 项 Chrome 浏览器检查：file:// 和 HTTP、实际 GPU 覆盖范围切换、相机拖拽、手机左右旋转/上下滚动、加载中选择保持、离屏释放/返回恢复、减少动态效果和 WebGL 失败回退；1920/1440/1280/768/390/320 下左右边界与夜视模块一致，无模块横向溢出。夜视滑块、红色告警图标与 8 个报名按钮正常，无脚本错误；已核对桌面和手机截图。官网 Header 保持逐字节一致，原 Intro/Product 播放代码未修改。
