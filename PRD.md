你是一名 Expo / React Native / TypeScript 工程师。请帮我开发一款潮汐类移动 App，当前前期以 Android App 为准，使用 Expo + TypeScript 实现，并确保项目可运行、可后续打包 APK。

重要背景：

- 当前优先开发 Android 版本
- 开发环境是 Windows
- 代码托管在 GitHub
- 打包方式是在 Ubuntu 24.04 环境中进行本地 APK 打包
- 项目后期希望保留 iOS 17+ 适配可能性，但当前验收重点是 Android APK
- 不要使用明显 Android-only 的业务逻辑写法，除非确实是 Android 打包配置需要
- 依赖选择要尽量兼容 Android / iOS，并适合 Expo 项目

技术栈：

- Expo
- TypeScript
- Expo Router
- React Native
- 
- 优先使用 Expo 生态官方能力
- 音频播放使用 Expo 生态中适合远程音频、循环播放、停止、切换的方案
- 使用 `react-native-safe-area-context` 处理安全区
- 可使用轻量状态管理，例如 React Context 或 zustand
- 不要引入过重或不必要的依赖
- 代码尽量简单、清晰、可维护

工程与打包要求：

- 项目应能在 Windows 上正常开发运行
- 项目应能提交到 GitHub 后，在 Ubuntu 24.04 环境中进行本地 Android APK 打包
- 请避免依赖 Windows 专属脚本
- npm scripts 应尽量跨平台
- 如需要环境变量或本地配置，请给出清晰说明
- 保留 EAS / Expo Android 构建所需的基础配置入口
- Android 包名、版本号、图标、启动页等配置应放在 `app.json` 或 `app.config.ts` 中，便于后续修改
- 不要依赖必须在 macOS 才能完成的 Android 构建流程
- 当前不要求实现 iOS 打包，但代码结构和依赖不要阻碍后期 iOS 17+ 适配

交付要求：

- 直接实现可运行代码
- 完成后输出「本次改动日志」
- 改动日志说明新增/修改了哪些内容、涉及哪些页面/文件
- 不要只做静态页面，所有核心按钮、计时器、音频播放、加载状态、错误状态都需要真实可交互

产品定位：
这是一款潮汐类放松 App，用于睡眠、专注、呼吸、冥想。整体风格安静、克制、沉浸、治愈。不要做营销落地页，App 打开后应直接进入可使用体验。

信息架构：
底部 Tab 必须包含 4 个页面：

1. 睡眠 Sleep
2. 专注 Focus
3. 呼吸 Breathe
4. 冥想 Meditate

数据源：
必须接入以下 API，并避免网络缓存造成数据不更新：

https://zzz-pet.oss-cn-hangzhou.aliyuncs.com/api/sounds.json

返回格式大致为：

{
"alarm": {
"id": "morning_joy",
"name": "Morning Joy",
"url": "[https://xxxx.mp3](https://xxxx.mp3/)",
"cover": ""
},
"sounds": [
{
"id": "cat_purr_1",
"name": "猫呼噜声",
"url": "[https://xxx.m4a](https://xxx.m4a/)",
"cover": "[https://xxx.jpg](https://xxx.jpg/)"
}
]
}

数据使用规则：

- `alarm` 用作睡眠闹钟音乐
- `sounds` 用作睡眠白噪音列表
- `sounds` 用作专注背景音列表
- 冥想页面可以使用静态数据，不强制依赖 sounds

请为 API 定义完整 TypeScript 类型，并实现数据请求服务。

全局通用体验要求：

- 网络请求必须包含：
    - 加载中
    - 失败提示
    - 失败重试
    - 空数据兜底
- 图片必须与显示区域一致
- 所有封面图以 1:1 展示，并使用填充裁剪效果
- cover 为空时提供优雅的占位样式
- 音频在切换页面时不要莫名停止，除非用户主动停止或业务流程要求停止
- 同一时间只允许播放一个音频
- 切换音频时必须停止上一个音频
- 离开页面时不能造成多个音频叠加
- 音频加载失败时需要给出 UI 提示
- 页面切换时全局播放状态要清晰

功能需求：

A. 睡眠 Sleep

1. 声音列表
- 使用两列网格展示 `sounds`
- 卡片展示：
    - 封面图
    - 名称文字叠在封面中心
- 点击任意卡片进入睡眠播放页
1. 播放页
- 页面展示：
    - 封面
    - 名称
    - 播放 / 暂停按钮
    - 返回入口
- 白噪音需要循环播放
- 如果用户切换声音，需要停止旧声音并播放新声音
- 播放状态需要和全局音频状态同步
1. 睡眠定时，按“醒来时间”
- 用户选择“醒来时间”后开始倒计时
- 页面显示剩余时间
- 若选择的醒来时间已过，默认视为“明天同一时间”
- 到点后：
    - 自动停止白噪音
    - 弹窗提示：“该起床了”
    - 同时播放 `alarm`
    - alarm 循环播放，最多 20 分钟
    - 弹窗只有一个按钮：“停止闹钟”
    - 点击“停止闹钟”后立即停止 alarm 并结束流程
    - 若用户未点击停止，20 分钟后也要自动停止 alarm 并结束流程

B. 专注 Focus

1. 番茄钟
- 提供两套模式：
    - 25/5：专注 25 分钟，休息 5 分钟
    - 50/10：专注 50 分钟，休息 10 分钟
- 页面展示：
    - 当前阶段：专注 / 休息
    - 剩余时间
    - 开始 / 暂停 / 结束按钮
1. 背景音
- 可选择一个 `sounds` 作为专注背景音
- 开始专注时自动播放背景音
- 暂停或结束时停止背景音
- 如果进入休息阶段，可以停止背景音或保持安静，保持逻辑清晰即可
1. 沉浸模式，简单版
- 提供沉浸模式开关
- 开启后：
    - 专注期间如果 App 进入后台，判定本次失败
    - 提示用户本次专注失败
    - 停止计时
    - 停止背景音
- 可以使用 React Native 的 AppState 实现

C. 呼吸 Breathe

1. 练习入口
提供 3 个呼吸练习入口，每个入口包含标题和适用场景说明：
- 4-4-4-4
    - 吸气 4 秒，屏息 4 秒，呼气 4 秒，屏息 4 秒，循环
    - 适合紧张、焦虑、需要快速冷静或稳住情绪
- 4-7-8
    - 吸气 4 秒，屏息 7 秒，呼气 8 秒，循环
    - 适合睡前放松，帮助更快入眠
- 5-5
    - 吸气 5 秒，呼气 5 秒，循环
    - 适合日常减压，恢复平静与专注
1. 训练页
- 3 个练习共用一个训练页面
- 页面显示：
    - 当前阶段：吸气 / 屏息 / 呼气
    - 圆球
    - 圆球内显示当前阶段倒计时秒数
    - 本次训练已进行时长
- 圆球动画：
    - 吸气：随时间变大
    - 屏息：保持大小不变
    - 呼气：随时间变小
- 操作按钮：
    - 开始
    - 暂停
    - 结束
- 结束后返回呼吸练习入口列表
- 动画要使用跨平台方案，避免 iOS/Android 差异过大

D. 冥想 Meditate

1. 列表
使用静态数据即可，包含 4 条：
- 快速入眠
- 考试压力
- 呼吸练习
- 身体扫描

每条展示：

- 标题
- 一句简介
1. 详情页
- 展示标题
- 展示简介
- 展示“开始”按钮
1. 引导页，最简版
- 进入后按段落展示引导文字
- 每个冥想主题提供 4-6 段引导文案即可
- 提供：
    - 下一段
    - 上一段
    - 结束
- 点击结束后返回冥想详情页或冥想列表页，流程保持简单一致

导航要求：

- 使用 Expo Router
- 底部 Tab 包含 Sleep / Focus / Breathe / Meditate
- 睡眠播放页、呼吸训练页、冥想详情页、冥想引导页可以作为 Stack 页面
- 当前播放声音在相关页面中要有清晰反馈
- Android 返回键行为要合理：
    - 从详情页返回列表
    - 从训练页/播放页返回上一级
    - 不应导致音频状态混乱

UI / 视觉要求：

- 风格参考潮汐类 App
- 精致、安静、沉浸、克制
- 不要做成普通后台管理 UI
- 不要做营销首页
- 首屏就是实际功能
- 睡眠页面偏夜晚、安静、低亮度
- 专注页面清爽、克制，适合工作和学习
- 呼吸页面柔和、留白充足
- 冥想页面简洁、舒缓
- 使用深色、自然色、柔和渐变或封面图营造氛围
- 卡片圆角、间距、字体层级要统一
- 按钮状态要明确
- 移动端适配要好，不能出现文字溢出、元素重叠或底部按钮被遮挡
- Android 状态栏、导航栏区域要适配
- 同时注意后期 iPhone 刘海屏、动态岛、安全区、底部 Home Indicator 的兼容空间
- 整体的UI风格偏梦幻，并且使用UI-UX-Pro-Max Skill

状态管理建议：
至少管理以下状态：

- 当前音频
- 当前播放类型：sleep / focus / alarm / none
- 是否播放中
- 是否加载中
- 音频错误
- 睡眠醒来时间
- 睡眠剩余时间
- alarm 是否正在播放
- 专注当前模式
- 专注当前阶段
- 专注剩余时间
- 沉浸模式是否开启
- 呼吸当前模式
- 呼吸当前阶段
- 呼吸训练已进行时长
- 冥想当前段落

建议目录结构：

- app/
    - _layout.tsx
    - (tabs)/
        - _layout.tsx
        - sleep.tsx
        - focus.tsx
        - breathe.tsx
        - meditate.tsx
    - sleep/
        - [id].tsx
    - breathe/
        - [mode].tsx
    - meditate/
        - [id].tsx
        - guide/[id].tsx
- components/
    - SoundCard.tsx
    - PlayerControls.tsx
    - TimerDisplay.tsx
    - TimerPicker.tsx
    - BreathingCircle.tsx
    - EmptyState.tsx
    - LoadingState.tsx
    - ErrorState.tsx
- hooks/
    - useAudioPlayer.ts
    - useCountdown.ts
    - useSounds.ts
    - useAppStateFocusGuard.ts
- services/
    - soundsApi.ts
- types/
    - sound.ts
    - meditation.ts
    - breathing.ts
- constants/
    - theme.ts
    - breathingModes.ts
    - meditationSessions.ts

Android / Ubuntu 24.04 本地打包注意点：

- 请确保项目可以在 Ubuntu 24.04 中安装依赖并构建 Android
- 避免使用 Windows-only 命令
- `package.json` scripts 应提供清晰命令，例如：
    - `npm run start`
    - `npm run android`
    - `npm run lint`
    - `npm run typecheck`
- 如果使用 EAS 本地构建 APK，请保留必要配置说明
- 如果使用 Expo prebuild + Gradle 构建 APK，请确保配置不要破坏 Expo 项目结构
- 当前目标是生成 Android APK，不要求生成 AAB
- 请在 README 或最终说明中写清楚 Ubuntu 24.04 下本地打包 APK 的建议命令

验收标准：

- App 可以通过 Expo 启动
- Android 模拟器或真机可正常运行
- 能从 API 拉取 sounds 和 alarm
- 网络加载、失败重试、空数据状态可用
- 睡眠声音两列网格可用
- 睡眠播放页可播放、暂停、循环白噪音
- 睡眠醒来时间倒计时可用
- 到点后能停止白噪音、弹窗、播放 alarm
- alarm 可手动停止，20 分钟后也能自动停止
- 专注番茄钟 25/5、50/10 可用
- 专注背景音可选择、播放、停止
- 沉浸模式下 App 进入后台能判定失败
- 呼吸 3 种模式可进入训练页
- 呼吸圆球动画、阶段倒计时、训练时长可运行
- 冥想列表、详情、引导段落流程可用
- 底部 Tab 与 Stack 页面导航正常
- Android 返回键行为合理
- UI 在 Android 常见屏幕尺寸下无明显重叠、溢出、遮挡
- TypeScript 无明显类型错误
- 代码结构清晰，便于后续扩展 iOS 17+

交付要求：
每次交付完成后
1、说明新增和修改哪些文件，把它写入到独立的日志文件中
2、保证项目任然可交付运行

注意：不要使用 SwiftUI，不要生成 iOS 原生项目。本项目必须是 Expo + TypeScript + React Native 项目，当前以 Android APK 为首要交付目标。