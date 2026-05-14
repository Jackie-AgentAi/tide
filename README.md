# TidePro2 - 潮汐放松 App

TidePro2 是一个基于 Expo / React Native / TypeScript 的潮汐类放松应用，面向 Android 当前交付，保留后续 iOS 17+ 适配空间。应用打开后直接进入功能界面，包含睡眠、专注、呼吸、冥想四个核心模块。

## 功能概览

- 睡眠 Sleep：白噪音两列列表、睡眠播放页、醒来时间倒计时、到点闹钟。
- 专注 Focus：25/5 与 50/10 番茄钟、背景音选择、沉浸模式。
- 呼吸 Breathe：4-4-4-4、4-7-8、5-5 三种呼吸练习与圆球动画。
- 冥想 Meditate：静态主题列表、详情页、多段引导流程。
- 全局音频：同一时间仅播放一路音频，切换曲目会停止上一段。

## 技术栈

- Expo SDK 54
- React Native 0.81
- React 19
- TypeScript
- Expo Router
- Zustand
- expo-av
- react-native-safe-area-context

## 目录结构

```text
app/             Expo Router 页面与路由
components/      可复用 UI 组件
constants/       主题、设计资源、默认声音数据
hooks/           数据与业务 hooks
services/        API 与音频服务
stores/          Zustand 全局状态
types/           TypeScript 类型
scripts/         设计资源处理脚本
assets/          应用图标、图片与生成资源
```

## 环境要求

- Node.js 20 LTS 或兼容版本
- npm
- Expo CLI，可通过 `npx expo ...` 使用
- Android Studio 与 Android SDK，用于模拟器或真机调试
- Windows 可完成日常开发与 `expo start`
- Ubuntu 24.04 可作为 Android APK 本地构建环境

## 安装依赖

```powershell
npm install
```

## 本地运行

启动 Expo 开发服务：

```powershell
npm run start
```

在 Android 模拟器或已连接真机上运行：

```powershell
npm run android
```

如果设备没有自动连接，可先确认 Android 调试环境：

```powershell
adb devices
```

## 常用脚本

```powershell
npm run start
npm run android
npm run lint
npm run typecheck
```

## API 与数据

远程声音数据来自：

```text
https://zzz-pet.oss-cn-hangzhou.aliyuncs.com/api/sounds.json
```

相关实现：

- [services/soundsApi.ts](services/soundsApi.ts)
- [hooks/useSounds.ts](hooks/useSounds.ts)
- [types/sounds.ts](types/sounds.ts)

请求使用 `cache: 'no-store'`，避免声音列表长期使用过期缓存。接口返回的 `alarm` 用于睡眠闹钟音乐，`sounds` 用于睡眠白噪音和专注背景音。

## 音频状态约定

音频播放由 [services/audioSession.ts](services/audioSession.ts) 统一管理，全局播放 UI 状态保存在 [stores/sessionStore.ts](stores/sessionStore.ts)。

关键约束：

- 同一时刻只允许一路音频播放。
- 播放新音频前会卸载上一段音频。
- 睡眠、专注、闹钟通过 `sleep` / `focus` / `alarm` 类型区分。
- 播放、暂停、加载、错误状态需要在 UI 中可见。

## Android 配置

Android 包名、图标与启动页集中在 [app.json](app.json)：

```text
package: com.tidepro.app
version: 1.0.0
scheme: tidepro2
```

图标资源位于：

```text
assets/extracted/app-icon/
```

## Ubuntu 24.04 本地 APK 构建路径

当前仓库未提交 `android/` 原生目录。需要本地构建 APK 时，可以在 Ubuntu 24.04 上通过 Expo prebuild 生成临时原生工程，再使用 Gradle 打包。

准备环境：

```bash
sudo apt update
sudo apt install -y openjdk-17-jdk unzip git
node --version
npm --version
```

安装依赖并生成 Android 工程：

```bash
npm ci
npx expo prebuild --platform android
```

构建 debug APK：

```bash
cd android
./gradlew assembleDebug
```

产物路径通常为：

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

构建 release APK 前需要配置签名信息。请不要把 keystore、密码或本地签名配置提交到仓库；可使用环境变量或本地未跟踪的 Gradle 配置文件管理。

## 配置与密钥

当前项目没有必须配置的业务环境变量。若后续加入私有 API、签名证书或第三方服务密钥，应放在本地环境变量、未提交配置文件或 CI Secret 中，并在本 README 更新对应说明。

## 开发约定

- 修改功能前先阅读 [SPEC.md](SPEC.md) 中相关验收要求。
- 保持 Expo、TypeScript、Expo Router 与 React Native 技术栈，不引入独立 iOS 原生工程。
- 使用 `react-native-safe-area-context` 处理安全区。
- 核心交互必须真实可用，不交付仅静态页面。
- 每次交付在 [CHANGELOG-session.md](CHANGELOG-session.md) 记录新增或修改文件。

## 发布前检查

建议至少执行：

```powershell
npm run typecheck
npm run lint
npm run android
```

发布前还需按 [SPEC.md](SPEC.md) 验证睡眠定时、闹钟、专注沉浸模式、呼吸训练、冥想引导、Android 返回键和常见屏宽 UI 表现。
