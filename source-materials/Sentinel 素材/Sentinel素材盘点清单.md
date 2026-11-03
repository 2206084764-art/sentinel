# Sentinel 可用素材盘点清单

扫描日期：2026-10-19。范围：当前工作文件夹及其子目录、ZIP 内容、PPTX 和 DOCX 内嵌资源。

本轮只做素材盘点和静态内容检查，未修改任何原始文件。本清单为新增文件。未逐页渲染 PPT/DOCX，未逐段播放视频，未运行浏览器交互或验证第三方网站；“可用”表示具备复用价值，不表示已确认当前产品参数或获得外部发布许可。

## 1. 总体数量与复用判断

以下数量为生成本清单前的原始目录统计，排除 .DS_Store：共 68 个文件，约 534 MiB（含 ZIP）。

| 类型 | 数量 | 内容与建议 |
|---|---:|---|
| PPTX | 1 | 16 页，含可编辑文字和图形，可作为外部 Webinar PPT 的改稿底稿 |
| HTML 演示单页 | 14 | 0–13 编号页面，涵盖痛点、产品、功能、案例和发布规划 |
| HTML 营销页 | 1 | Sentinel-Marketing.html，最接近 Landing Page，可沿用现有页面修改 |
| HTML 播放器 | 1 | 当前串联 13 页，未纳入 3-TheAnswer.html |
| HTML 3D 场景 | 11 | 产品、卡车、安装、AI、IoT 等演示 |
| 图片 | 28 | Images 中 27 张，加 Branding 中 1 张 Logo |
| MP4 | 6 | 痛点录像、AOV、姿态识别、客户案例 |
| DOCX | 3 | 规格书、安装指南、用户手册 |
| JavaScript | 1 | i18n.js，多语言字典和切换逻辑 |
| README | 1 | 说明文档，部分内容已与现状不一致 |
| ZIP | 1 | 与解压目录的 66 个非系统文件内容一致，无额外素材 |

没有发现独立的 PSD、AI、SVG、GLB、GLTF、FBX、Blend、PDF、讲师照片或 Webinar 报名配置文件。3D 模型数据包含在 HTML 中，不是另附的模型工程。

## 2. 最值得优先复用的成品

| 文件 | 体积 | 现有内容 | 后续用途 |
|---|---:|---|---|
| [Sentinel-Product-Presentation.pptx](<Sentinel-Product-Presentation.pptx>) | 3.82 MiB | 16 页英文产品演示，文字/图形可编辑，15 张内嵌图片 | Webinar PPT 底稿 |
| [Sentinel-Marketing.html](<Sentinel Keynote HTML/Sentinel-Marketing.html>) | 78.4 KiB | 产品介绍、6 大能力、安装、AI、告警演示、IoT、夜视对比、客户案例和资源下载 | Webinar Landing Page 底稿 |
| [Player点我点我.html](<Sentinel Keynote HTML/Player点我点我.html>) | 6.4 KiB | 键盘翻页、跳转、全屏和逐页动画 | 内部审稿、现场辅助演示 |
| [Sentinel Keynote HTML 2.zip](<Sentinel Keynote HTML 2.zip>) | 228.07 MiB | 上述 HTML 素材包备份 | 归档，无需重复整理 |

营销页目前是产品展示页，CTA 指向 Streamax 通用联系表单。未发现 Webinar 报名表、Zoom/Salesforce 接入或 GA4/GTM 安装代码。已有 Page Title 和 Meta Description，后续应随活动主题调整。

语言资源包括英语默认界面及西班牙语、葡萄牙语、法语、意大利语、阿拉伯语；本轮未验证翻译完整性及语言切换运行效果。

### PPT 16 页内容

| 页码 | 内容 | 外部版本建议 |
|---:|---|---|
| 1 | 产品封面、400 mW / 90 天 / 0.02 lux | 改为 Webinar 标题和活动信息；参数待统一 |
| 2 | 货物盗窃、燃油盗窃 | 可作行业痛点开场 |
| 3 | 行业损失和盗窃分布数字 | 对外前核对统计来源、年份和适用范围 |
| 4 | 传统视频与传感器方案对比 | 可复用，避免过度绝对化竞品表述 |
| 5 | AOV 产品定位 | 可复用；“industry first”等表述待确认 |
| 6 | 产品核心参数、六项能力 | 可复用，先统一技术口径 |
| 7 | 熄火后持续守护 | 可复用，写清低帧率与触发后的录制模式 |
| 8 | 1 fps / 触发全帧、功耗与存储比较 | 适合机制讲解，核对测试前提 |
| 9 | Black Light Ultra 夜视对比 | 适合演示，确认对比场景与照度证据 |
| 10 | Intent-Aware AI、98.67% 准确率 | 核对测试定义、样本和当前算法版本 |
| 11 | 燃油、胎压、温湿度、门磁 IoT 联动 | 核对已交付能力和兼容范围；部分数值属于示意 |
| 12 | 安装和供电 | 与专业安装、接线和校准要求统一 |
| 13 | 试点、订单、销售管线和潜在客户 | 属内部商业信息，外部版建议移除或改成获准的案例摘要 |
| 14 | Kenya 单车前后对比、售价及回报计算 | 有案例价值，需确认授权、统计口径和价格是否公开 |
| 15 | 真实事件截图 | 适合案例演示，确认对外可用及必要脱敏 |
| 16 | 2026 年 8 月上市、Bug 数量、网站域名 | 重写为 Webinar CTA / Q&A；内部研发数据不适合直接外放 |

PPT 的 15 张内嵌图片均与素材目录中的图片逐字节一致；没有额外内嵌视频。PPT 存在演讲备注，但多数页备注为空，不构成完整讲稿。

## 3. HTML 演示稿逐页清单

| 文件 | 主题 | 可用方向 / 注意事项 |
|---|---|---|
| [0-Cover.html](<Sentinel Keynote HTML/0-Cover.html>) | 产品发布封面 | 产品定位、首屏文案；含 CONFIDENTIAL 标记 |
| [1-PainPoints.html](<Sentinel Keynote HTML/1-PainPoints.html>) | 货物/燃油盗窃痛点和统计 | 行业背景与问题引入；外部统计及单车计算待核对 |
| [2-TheGap.html](<Sentinel Keynote HTML/2-TheGap.html>) | 传统传感器与视频方案的取舍 | 方案差异和产品价值解释 |
| [3-TheAnswer.html](<Sentinel Keynote HTML/3-TheAnswer.html>) | AOV 答案与定位 | 可作转场；文件存在，但播放器未编入 |
| [4-Sentinel.html](<Sentinel Keynote HTML/4-Sentinel.html>) | 产品揭幕、核心参数和安装覆盖 | 首屏产品介绍、PPT 产品页 |
| [5-AOV.html](<Sentinel Keynote HTML/5-AOV.html>) | AOV 模式、日夜守护和录制机制 | 技术原理讲解、产品演示 |
| [6-IntentAI.html](<Sentinel Keynote HTML/6-IntentAI.html>) | 误报问题、姿态识别、AI 演示 | Webinar Demo 核心素材 |
| [7-BlackLightUltra.html](<Sentinel Keynote HTML/7-BlackLightUltra.html>) | 夜视三方对比 | 画质对比和夜间场景 |
| [8-AllInOne.html](<Sentinel Keynote HTML/8-AllInOne.html>) | 通信、存储、I/O 和磁吸结构 | 产品集成度说明 |
| [9-IoTSynergies.html](<Sentinel Keynote HTML/9-IoTSynergies.html>) | 多传感器联动与统一告警 | IoT 场景介绍；功能状态待确认 |
| [10-EasyInstall.html](<Sentinel Keynote HTML/10-EasyInstall.html>) | 磁吸、供电和安装位置 | 安装说明；需与技术文档统一 |
| [11-Summary.html](<Sentinel Keynote HTML/11-Summary.html>) | 六项能力总结 | 总结页；含可隐藏的模型调姿面板 |
| [12-GlobalCases.html](<Sentinel Keynote HTML/12-GlobalCases.html>) | 全球试点、订单、客户、现场案例和回报 | 案例素材丰富，但有内部销售数据和客户信息 |
| [13-ReleasePlan.html](<Sentinel Keynote HTML/13-ReleasePlan.html>) | 上市、协同、开放生态规划及 CTA | 按当前版本与外部活动目标重写 |

## 4. 图片素材（28 张）

图片已读取并检查尺寸，以下为独立图片文件；不将 PPT/DOCX 内嵌图片重复计入。

| 文件 | 尺寸 | 体积 | 建议用途 |
|---|---:|---:|---|
| [streamax.png](<Sentinel Keynote HTML/Branding/streamax.png>) | 10736×1362 | 362.8 KiB | 官方 Logo；当前营销页引用路径错误，正确文件位于 Branding |
| [ai-still.jpg](<Sentinel Keynote HTML/Images/ai-still.jpg>) | 1920×1080 | 565.1 KiB | AI 演示封面 / 视频海报 |
| [aov-still.jpg](<Sentinel Keynote HTML/Images/aov-still.jpg>) | 1392×768 | 158.9 KiB | AOV 监控演示封面 |
| [bg-beam.jpg](<Sentinel Keynote HTML/Images/bg-beam.jpg>) | 2560×1440 | 73.8 KiB | 演示稿氛围背景 |
| [alert-night.jpg](<Sentinel Keynote HTML/Images/cases/alert-night.jpg>) | 560×306 | 16.6 KiB | 夜间告警截图，尺寸较小 |
| [cap1.jpg](<Sentinel Keynote HTML/Images/cases/cap1.jpg>) | 900×507 | 107.0 KiB | 真实场景监控截图；对外展示前检查人物、车牌、定位等信息 |
| [cap2.jpg](<Sentinel Keynote HTML/Images/cases/cap2.jpg>) | 900×507 | 139.9 KiB | 真实场景监控截图；对外展示前检查人物、车牌、定位等信息 |
| [cap3.jpg](<Sentinel Keynote HTML/Images/cases/cap3.jpg>) | 900×507 | 152.4 KiB | 真实场景监控截图；对外展示前检查人物、车牌、定位等信息 |
| [cap4.jpg](<Sentinel Keynote HTML/Images/cases/cap4.jpg>) | 900×507 | 102.2 KiB | 真实场景监控截图；对外展示前检查人物、车牌、定位等信息 |
| [cap5.jpg](<Sentinel Keynote HTML/Images/cases/cap5.jpg>) | 900×507 | 139.5 KiB | 真实场景监控截图；对外展示前检查人物、车牌、定位等信息 |
| [cap6.jpg](<Sentinel Keynote HTML/Images/cases/cap6.jpg>) | 900×507 | 132.4 KiB | 真实场景监控截图；对外展示前检查人物、车牌、定位等信息 |
| [cap7.jpg](<Sentinel Keynote HTML/Images/cases/cap7.jpg>) | 900×507 | 124.5 KiB | 真实场景监控截图；对外展示前检查人物、车牌、定位等信息 |
| [cap8.jpg](<Sentinel Keynote HTML/Images/cases/cap8.jpg>) | 900×507 | 93.3 KiB | 真实场景监控截图；对外展示前检查人物、车牌、定位等信息 |
| [cap9.jpg](<Sentinel Keynote HTML/Images/cases/cap9.jpg>) | 900×507 | 89.4 KiB | 真实场景监控截图；对外展示前检查人物、车牌、定位等信息 |
| [curve-0308.png](<Sentinel Keynote HTML/Images/cases/curve-0308.png>) | 1200×274 | 90.8 KiB | 客户油量曲线，可用于案例证据 |
| [curve-0327.png](<Sentinel Keynote HTML/Images/cases/curve-0327.png>) | 1200×276 | 91.4 KiB | 客户油量曲线，可用于案例证据 |
| [poster-ampenet.jpg](<Sentinel Keynote HTML/Images/cases/poster-ampenet.jpg>) | 959×1200 | 303.9 KiB | 客户自制产品海报，可作为合作案例材料 |
| [hero-truck.jpg](<Sentinel Keynote HTML/Images/hero-truck.jpg>) | 2560×1280 | 269.0 KiB | 卡车横幅，适合 Landing Page 首屏 / PPT 封面 |
| [nv-blacklight.jpg](<Sentinel Keynote HTML/Images/nv-blacklight.jpg>) | 1144×624 | 130.1 KiB | 普通黑光夜视对比 |
| [nv-iphone.jpg](<Sentinel Keynote HTML/Images/nv-iphone.jpg>) | 1066×774 | 13.9 KiB | 手机夜视对比，图像本身几乎全黑 |
| [nv-ultra.jpg](<Sentinel Keynote HTML/Images/nv-ultra.jpg>) | 1276×603 | 168.4 KiB | Sentinel 夜视对比 |
| [sentinel-dim.png](<Sentinel Keynote HTML/Images/sentinel-dim.png>) | 1800×1011 | 405.4 KiB | 产品外观图 |
| [sentinel-front.png](<Sentinel Keynote HTML/Images/sentinel-front.png>) | 1800×1011 | 489.0 KiB | 产品正面图 |
| [sentinel-side.png](<Sentinel Keynote HTML/Images/sentinel-side.png>) | 1800×1011 | 404.7 KiB | 产品侧面图 |
| [theft-cargo.jpg](<Sentinel Keynote HTML/Images/theft-cargo.jpg>) | 1920×1080 | 157.9 KiB | 货物盗窃场景，含新闻画面标识 |
| [theft-fuel.jpg](<Sentinel Keynote HTML/Images/theft-fuel.jpg>) | 640×360 | 26.1 KiB | 燃油盗窃场景，640×360，不适合大幅放大 |
| [truck-xray.png](<Sentinel Keynote HTML/Images/truck-xray.png>) | 1800×900 | 1017.7 KiB | 卡车透视 / 安装与系统结构示意 |
| [world-dots.png](<Sentinel Keynote HTML/Images/world-dots.png>) | 1920×1068 | 30.5 KiB | 全球分布背景 |

产品外观图适合直接排版；案例截图适合作为证据材料。夜视对比图片长宽比例不一致，排版时需要统一显示区域并避免拉伸。

## 5. 视频素材（6 段）

时长和分辨率来自 MP4 容器元数据；内容用途依据现有 HTML 引用和文案归类，本轮未逐段播放。现有视频均未发现独立字幕或讲解音轨文件。

| 文件 | 时长 | 分辨率 | 体积 | 建议用途 |
|---|---:|---:|---:|---|
| [ai-pose.mp4](<Sentinel Keynote HTML/Videos/ai-pose.mp4>) | 37.80 秒 | 1920×1080 | 42.73 MiB | AI 姿态识别演示，优先选用；网页使用前可压缩 |
| [aov-loop.mp4](<Sentinel Keynote HTML/Videos/aov-loop.mp4>) | 30.99 秒 | 1392×768 | 3.06 MiB | AOV 工作机制 / 监控片段 |
| [cargo theft cctv.mp4](<Sentinel Keynote HTML/Videos/cargo theft cctv.mp4>) | 26.73 秒 | 3840×2160 | 98.25 MiB | 货物盗窃痛点，约 98 MiB，网页需裁剪与压缩 |
| [case-ampenet.mp4](<Sentinel Keynote HTML/Videos/case-ampenet.mp4>) | 7.00 秒 | 1920×1080 | 3.49 MiB | Ampenet / Tanzania 案例短片，适合 Demo |
| [case-caught.mp4](<Sentinel Keynote HTML/Videos/case-caught.mp4>) | 3.44 秒 | 1920×830 | 1.16 MiB | 抓拍事件短片，适合案例页 |
| [theft-cctv.mp4](<Sentinel Keynote HTML/Videos/theft-cctv.mp4>) | 130.66 秒 | 640×360 | 5.66 MiB | 燃油盗窃背景片段，适合截取重点，不宜大幅放大 |

## 6. 3D 与交互场景（11 个）

这些是可嵌入网页的 HTML 场景，使用 Three.js CDN；离线演示需要另做依赖处理。PPT 中不能直接按现有 HTML 方式嵌入运行，后续宜选取截图、录屏，或提供外部演示链接。独立场景合计约 128 MiB，不能不加选择地全部放进 Landing Page 首次加载。

| 文件 | 体积 | 场景 / 用途 |
|---|---:|---|
| [camera-pod-wire.html](<Sentinel Keynote HTML/3D/camera-pod-wire.html>) | 23.1 KiB | 摄像头线框示意 |
| [cctv-camera-wire.html](<Sentinel Keynote HTML/3D/cctv-camera-wire.html>) | 228.9 KiB | 传统视频设备示意，用于方案比较 |
| [fuel-sensor-wire.html](<Sentinel Keynote HTML/3D/fuel-sensor-wire.html>) | 24.1 KiB | 油位传感器示意，用于方案比较 |
| [globe-only.html](<Sentinel Keynote HTML/3D/globe-only.html>) | 159.5 KiB | 地球 / 全球场景 |
| [globe-sentinel.html](<Sentinel Keynote HTML/3D/globe-sentinel.html>) | 15.43 MiB | 地球与产品的发布演示 |
| [sentinel-only.html](<Sentinel Keynote HTML/3D/sentinel-only.html>) | 15.28 MiB | 产品三维外观，适合产品旋转展示 |
| [sentinel-soc.html](<Sentinel Keynote HTML/3D/sentinel-soc.html>) | 15.27 MiB | 产品内部集成结构演示 |
| [truck-day-night.html](<Sentinel Keynote HTML/3D/truck-day-night.html>) | 18.48 MiB | 卡车日夜变化，辅助 AOV 演示 |
| [truck-sentinel-mount.html](<Sentinel Keynote HTML/3D/truck-sentinel-mount.html>) | 18.48 MiB | 卡车安装位置及覆盖范围 |
| [truck-sentinel-runner.html](<Sentinel Keynote HTML/3D/truck-sentinel-runner.html>) | 26.36 MiB | 人物接近车辆 / 油箱的 AI 行为演示 |
| [truck64-iot.html](<Sentinel Keynote HTML/3D/truck64-iot.html>) | 18.28 MiB | 卡车与多传感器 IoT 联动 |

## 7. 技术文档与支持文件

| 文件 | 体积 | 现有内容 | 建议用途 |
|---|---:|---|---|
| [S5 Product Specification.docx](<Sentinel Keynote HTML/Docs/S5 Product Specification.docx>) | 905.6 KiB | 产品能力、接口、功耗、照度、环境等级、尺寸、连接图；16 个内嵌媒体文件 | 技术参数核对和 FAQ 来源；不宜直接沿用全部营销表述 |
| [S5 Installation Guide.docx](<Sentinel Keynote HTML/Docs/S5 Installation Guide.docx>) | 3.83 MiB | 螺丝固定、磁吸安装、供电、SIM/SD 卡、角度调整、AI 校准；34 个内嵌媒体文件 | 安装示意和部署流程；对外可制作精简版 |
| [S5 User Manual.docx](<Sentinel Keynote HTML/Docs/S5 User Manual.docx>) | 8.81 MiB | 登录、Veyes、配置、回放、导出、网络、告警、围栏、AI 校准等；91 个内嵌媒体文件 | Demo / Q&A 技术储备；不建议完整搬进主讲 PPT |
| [i18n.js](<Sentinel Keynote HTML/i18n.js>) | 110.3 KiB | 多语言字典和页面翻译切换 | 多地区活动版本的语言基础，新增活动内容需补译 |
| [README.md](<Sentinel Keynote HTML/README.md>) | 2.0 KiB | HTML Keynote 播放方式及旧素材来源说明 | 参考用途；部分参数和页码已过时 |

技术文档合计另有 141 个内嵌媒体文件，可继续提取安装图、接线图、尺寸图、软件截图；其中可能有重复 Logo 和通用图标，尚未逐张去重，不应等同于 141 张新增独立营销图片。

## 8. 外部版本前必须统一的内容

下面是文件之间的差异，不是对当前产品实际能力的判断。规格书本身也注明实验室数据及版本/环境影响，不能直接认定任何一个文件是当前最终口径。

| 项目 | 发现的差异 / 问题 | 后续处理 |
|---|---|---|
| AOV 功耗 | HTML/PPT 为约 400 mW；规格书原文写“about 500MW”；README 写 200 mW | 明确当前量产版本、功耗模式、测试条件及单位；不能把 500MW 当作已确认参数 |
| 夜视照度 | HTML/PPT 为 0.02 lux；规格书为 Color 0.05 Lux/F1.2；README 仍写 2.5 lux | 统一产品版本和测试标准，确认对比图的拍摄条件 |
| 存储 | 营销稿写 64 GB eMMC / 12 天；规格书、手册写单 Micro SD、最高 1 TB | 明确配置、介质、录制模式、容量与保留时间关系 |
| 蓝牙 / IoT | 营销页按现成能力介绍；用户手册 Bluetooth 项注明 under development | 确认当前发布状态、传感器类型和兼容清单 |
| 安装 | 营销稿强调任何司机数分钟完成、无布线；规格书要求专业安装，指南含固定、供电和校准 | 明确磁吸固定与完整设备部署的区别；保留必需安装条件 |
| 90 天守护 | 营销稿强调熄火后在车辆电瓶上守护；PPT 含 80 Ah 电瓶对比 | 确认电池容量、电压、低压保护、触发频率和环境条件 |
| AI 精度 | PPT 第 10 页写 98.67%、7 次迭代、9,447 个真实样本 | 确认指标定义、样本构成和当前版本；避免“零误报”等绝对承诺 |
| 行业统计 | 包括 $17–35B、65%、26% 等，HTML 有二手来源名称 | 补充可追溯出处、统计年份和适用范围；本轮未联网验证 |
| 内部商业数据 | 21 客户、25 台 POC、67 台订单、3,800+ pipeline、后续预期订单和客户名单 | 建议从外部稿移除，或仅保留获准公开的事实 |
| 客户案例 | Ampenet / Tanzania、Texas / Kenya、人物/车牌/GPS 等 | 确认案例授权与可公开的数据、画面范围 |
| 单车 ROI | $206→$5/月、两个月回本、603% annual return、$400 终端价 | 确认单车数据、价格与计算定义；不能直接推广为普遍结果 |
| 上市与路线图 | PPT 写 2026 年 8 月上市；HTML 同时出现 pre-launch / shipping / pilots | 相对扫描日期已经属于历史资料，需按当前状态重写 |
| 内部研发 / 保密标识 | HTML 封面 CONFIDENTIAL；PPT 末页含 312 bugs→7 | 外部版本移除或重写 |
| 营销域名 | PPT 第 16 页写 streamax-sentinel.com | 未验证所有权、可访问性和正式用途，不能直接当报名入口 |

## 9. 当前文件与页面问题

1. 营销页引用 `Images/streamax.png`，文件不存在；正确 Logo 位于 `Branding/streamax.png`。
2. 营销页下载链接引用 `Docs/Sentinel-Product-Presentation.pptx`，文件不存在；PPT 实际位于工作文件夹根目录。
3. `3-TheAnswer.html` 存在，但播放器 FILES 列表未纳入，目前播放器只有 13 页。
4. README 的发布计划页名写 `12-ReleasePlan.html`，当前实际文件为 `13-ReleasePlan.html`，第 12 页已是 GlobalCases；README 引用的 `Sentinel Marketing .pptx`、`Sentinel发布会框架.pptx` 在当前目录未找到。
5. ZIP 中播放器文件名有字符编码显示异常，但文件内容与解压目录的中文文件名版本一致，其余 65 个非系统文件也逐字节一致。它不构成新版本素材。
6. 3D 场景依赖 jsDelivr，网页字体依赖 Google Fonts；离线可用性尚未验证。
7. 部分页面包含模型调姿、线框、粒子视图等演示控制，以及前端告警演示。外部页面需决定保留哪些展示方式；这些展示本身不能视为已接入真实设备/平台。

## 10. Webinar 还缺少的活动素材

未在当前目录找到下列独立活动素材或配置：

- 对外活动标题、副标题、目标受众和本次活动语言。
- 日期、开始时间、时区、预计时长。
- 讲师姓名、职位、简介、头像和主持人信息。
- 3–4 条参会收益、完整议程、Demo 环节、Q&A 安排。
- 正式报名入口 / Zoom Webinar 信息，以及注册成功页和确认流程。
- 报名字段、隐私与同意文案、线索归属和 Salesforce 流程。
- 本次活动的 UTM 规则、GA4/GTM 事件及转化定义。
- 外部确认版产品参数、可公开案例、最新上市状态及获准使用的客户名称。
- Webinar 专用封面、邀请海报、邮件横幅、录播/会后跟进文案。

## 11. 建议规划顺序

1. 先形成一页“对外产品口径”：统一功耗、照度、存储、蓝牙/IoT、安装、90 天条件和可公开案例。
2. 确定 Webinar 标题、受众、语言、时间、讲师和报名流程。
3. Landing Page 沿用现有营销页，保留产品图、核心价值和一个获准案例，补齐活动信息、议程和报名 CTA；按实际用途选择少量轻量演示资源。
4. PPT 沿用现有 16 页可编辑稿，保留痛点、方案、AOV、AI、夜视、安装和案例，重写内部销售/研发/上市内容，并补齐活动开场、议程和 Q&A。
5. 从现有视频中选取 AI、AOV、客户案例短片，剪辑和压缩后用于外部演示。
6. 最后验证 Desktop/Mobile、资源路径、视频、报名闭环、UTM 和统计事件。

本轮没有修改或修复上述问题，便于先确定活动规划与对外内容范围。
