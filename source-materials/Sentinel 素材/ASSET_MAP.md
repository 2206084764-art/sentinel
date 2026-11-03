# Sentinel 素材映射

原始来源始终为 `Sentinel Keynote HTML/`；页面只读取 `assets/` 下副本。

| 页面用途 | 页面资源 | 原始来源 |
|---|---|---|
| Hero / Explorer 外观 | assets/3d/product-view.html | sentinel-only / sentinel-soc 内嵌的相同真实 Sentinel GLB |
| Intro / 案例地球 | assets/3d/globe-only.html | 3D/globe-only.html，改品牌绿及较低粒子密度 |
| 产品内部 | assets/3d/sentinel-soc.html | 3D/sentinel-soc.html |
| AOV | assets/3d/truck-day-night.html | 3D/truck-day-night.html，复制版新增真实滚动进度控制 |
| AI | assets/3d/truck-sentinel-runner.html | 3D/truck-sentinel-runner.html |
| 集成概念 | assets/3d/truck64-iot.html | 3D/truck64-iot.html |
| 安装 | assets/3d/truck-sentinel-mount.html | 3D/truck-sentinel-mount.html |
| 传统方案比较 | assets/3d/cctv-camera-wire.html、fuel-sensor-wire.html | 对应原始 3D HTML |
| 备用源场景副本 | sentinel-only.html、globe-sentinel.html、camera-pod-wire.html | 对应原始文件；当前未作为默认自动加载场景 |
| 产品和场景图片 | assets/images/*.webp | Images 同名 JPG/PNG，按需压缩，不拉伸 |
| 案例图片 | assets/images/cases/*.webp | Images/cases 同名图片；内部预览 |
| 视频 | assets/videos/*.mp4 | Videos 同名文件，空格文件名在副本中替换为连字符 |
| 官方 Footer Logo / 动画 | streamax-footer.png、streamax-robot.png | 源 Header/Footer 已使用的 Streamax 官网素材 |
| 自托管字体 | Outfit Latin variable | Fontsource Outfit 5.2.6 |
| 能量粒子 | assets/shaders/energy.vert、energy.frag | 本轮编写；未找到 CrystalizedBall.jsx 源码 |

## 场景适配

复制版删除了页面对内嵌模型 Data URL 的依赖，保留原始 CAD/车辆几何、相机基础及演示逻辑。增加本地 import map、frame-lifecycle 消息接口、隐藏原编辑面板、降低像素比及品牌绿调整。

`asset-map.json` 记录逐文件复制映射与 GLB 哈希。6 个独立 GLB 为 SHA-256 前 12 位命名，体积合计约 22 MiB，多个场景共用 Sentinel 产品模型。

## 视频处理

采用 macOS AVFoundation 生成独立 H.264 MP4，最大约 1280×720，目标码率约 1.3 Mbps，网络优先布局；网页副本移除音频以适配静音展示。

- 货物盗窃：截取前 18 秒，约 98.25 → 2.79 MiB。
- 燃油盗窃：原片第 10 秒起截取 24 秒，约 5.66 → 3.50 MiB。
- AI：约 42.73 → 5.64 MiB。
- AOV：约 3.06 → 4.82 MiB；保持 720p 细节，源文件原本压缩率更高。
- 两段案例：分别约 1.25 / 0.54 MiB。

原视频均未修改。展示视频不是具有声音的 Webinar 录播。

## 本地依赖

- Three.js 0.161.0，来自 npm 官方发行包；LICENSE 保留在 vendor/three。
- three-mesh-bvh 0.7.6，用于原有产品线框/粒子场景。
- GSAP / ScrollTrigger 3.13.0。
- Outfit variable 字体。

原始素材、DS100 参考 HTML、ZIP、PPTX 的保护哈希已在开发过程核对，未发现修改。
