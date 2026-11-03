# Sentinel Webinar Demo

入口：`index.html`。这是英文静态演示站，保留公司 Header/Footer，主体内容按 Sentinel 产品故事组织。原始素材、DS100 参考页、ZIP 和 PPTX 均不修改。旧入口备份在 `backups/`。

## 本地预览

在当前文件夹打开终端并运行：

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

打开 `http://127.0.0.1:8765/index.html`。如果已有服务器运行，直接打开此地址。不要用 `file://` 验证模块脚本、Shader 或 GLB 加载。

无需 npm 安装或构建。页面运行依赖已保存在 `assets/js/vendor/`，字体、图片和机器人动画均为本地资源。公司链接仍打开官网。HTTP 服务器或 GitHub Pages 均可部署，资源使用相对路径。

## 配置活动信息

打开 `assets/js/webinar-config.js` → 找到 `window.WEBINAR_CONFIG` → 在 `sessions` 内填写已确认的场次 → 保存 → 刷新页面核对。

- `title` / `subtitle`：统一配置入口，当前页面标题文案亦保留在 index.html。
- `sessions[].region`：场次名称。
- `date` / `time` / `timezone`：例如日期采用 YYYY-MM-DD，时间采用 HH:mm，时区采用 IANA 时区名。可填写顶层默认值或场次值。
- `startISO`：更推荐填写带 UTC 偏移的完整 ISO 时间，避免夏令时歧义。`endISO` 为结束时间配置预留。
- `language`：活动语言。
- `speaker`：数组，每人可填 `name`、`jobTitle`、`company`、`headshot`、`introduction`。只填写确认过的真实信息。
- `zoomUrl`：正式 HTTPS 注册地址。现有查询参数优先，页面 UTM 只补充尚未存在的参数。
- 空日期不显示倒计时；空 Zoom URL 显示 Registration Coming Soon，点击后说明尚未开放。
- 顶部、Hero 和 Agenda 的 Register Now 都导向 Registration；场次内有正式地址后，直接以新标签打开该地址。

当前没有活动日期、讲师、语言或 Zoom 链接。页面不含虚构场次，也不采用 DS100 的活动数据。

## 页面与交互

- 可跳过、单标签会话只播放一次的粒子与真实 3D 地球 Intro。
- Sentinel 真实 GLB 产品 Hero，保留图片海报；桌面有轻微相机/指针响应和粒子背景。
- CCTV 场景横向手风琴、GSAP 横向比较、产品探索舞台。
- Explorer 支持拖动旋转、视角重置、局部缩放、外观/内部场景切换。热点是与画面配合的 HTML 注释，未绑定每个 CAD 零件。
- AOV 桌面固定舞台：滚动进度直接控制原场景太阳轨道与照明，不再使用原来的时间循环。
- 触摸/键盘可操作的夜视图片 range 滑块，图片以 contain 保持比例。
- AI 概念人物路径、WebGL 聚合粒子、实际 AI 演示视频之间切换。
- 集成概念、安装位置与覆盖体积、案例视频和图片弹窗、Agenda、讲师待公布区及报名卡片。
- 手机/平板简化横向固定滚动；手机默认真实图片海报，Explorer 可主动加载 3D。
- Reduced Motion 跳过 Intro、粒子、自动播放和桌面固定滚动；保留内容和可主动加载的 3D。
- WebGL 不可用时保留真实图片和报名路径。

## 资源生命周期

`SceneManager` 提供 loadScene、activateScene、pauseScene、disposeScene、onResize。任一时刻最多挂载一个主要 3D iframe。进入新的场景前销毁前一个；帧率循环在离屏、页面隐藏或弹窗播放时停止。粒子使用一个共享 WebGL Canvas，显示位置和状态按章节切换。

原始 3D HTML 的内嵌模型已经提取到 6 个去重 GLB；复制场景使用本地 Three.js 0.161.0。原始几何保留。新产品外观舞台对 CAD 使用展示材质，并隐藏部分微小内部零件以减轻渲染，外观以最终实物为准。

## Analytics

不加载旧 DS100 的 GTM / GA4 / LinkedIn ID。`analytics.enabled` 控制 dataLayer 推送。

事件：page_view、source_entry、click_register、video_play、video_complete、section_view。

UTM 支持 source、medium、campaign、content，首次进入读取查询参数；未带新参数时使用当前标签会话缓存，再回退 referrer / direct。注册 URL 已有参数优先。点击注册不是注册完成，不产生 registration_complete。

验证方式：打开页面 → 浏览器开发者工具 Console → 输入 `window.dataLayer` → 点击 CTA、播放视频、滚动章节 → 核对事件及 UTM。要接入正式 GTM/GA4，需提供正式 ID、隐私与同意要求；目前仅保留配置字段和 dataLayer 接口，未自动插入第三方追踪脚本。

## 对外发布前

案例画面明确标注 Internal preview only；客户名称、销量、管线、ROI、测试精度和冲突参数均未写入营销主文案。案例授权、隐私处理和产品版本需要确认。IoT 场景按概念演示表述，不表示所有传感器已经兼容。

本轮没有发布网站，也没有修改或生成 PPTX。实际检查与简化范围见 `QA_REPORT.md`。

开发参考：[GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)、[Three.js](https://threejs.org/docs/)。
