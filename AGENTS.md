# AGENTS.md — 协作规则与开发环境

面向在本仓库中工作的 AI Agent 与人类开发者：约定「怎么干」——工具链、约束、目录习惯与交付约定，不重复罗列业务验收条目（见 `SPEC.md`）。

---

## 1. 模型与文档关系（本会话）

- **权威需求**：`SPEC.md`（干什么、如何验收）。
- **原始产品说明**：`PRD.md`（若有冲突，以实现与 `SPEC.md` 对齐为准；重大分歧需人工确认）。
- **本文**：环境与协作规则；修改代码时不得与本文件、`SPEC.md` 中的硬性约束冲突。

---

## 2. 技术栈与禁区

| 必须 | 禁止 |
|------|------|
| Expo、TypeScript、Expo Router、React Native | SwiftUI、独立 iOS 原生工程 |
| `react-native-safe-area-context` 处理安全区 | 明显 Android-only 的业务逻辑（Android 打包配置除外） |
| 远程音频：Expo 生态内可循环、停止、切换的方案 | 过重依赖；非必要的原生模块堆砌 |

- 依赖优先 Expo 官方能力；状态可用 Context 或 zustand，保持简单。
- 保留后续 **iOS 17+** 适配空间：不写死平台分支业务，除非配置必需。

---

## 3. 运行与构建环境

| 场景 | 要求 |
|------|------|
| 日常开发 | **Windows** 上项目可安装依赖、`expo start` 可运行 |
| CI / 打包参考 | **Ubuntu 24.04** 本地 Android APK 构建路径须文档化 |
| 脚本 | **npm scripts 跨平台**；禁止依赖 Windows-only 命令 |
| 配置 | 环境变量、密钥、本地覆盖须在 README 或单独配置说明中写清 |

- Android **包名、版本、图标、启动页**：集中在 `app.json` 或 `app.config.ts`。
- 保留 **EAS / Expo Android** 构建所需基础配置入口。
- 不要求在 macOS 上才能完成 Android 构建；当前交付 **APK**，不要求 AAB。

---

## 4. 代码与目录约定

建议对齐 PRD 中的结构（可按实现微调，但需保持可读、可扩展）：

- `app/` — Expo Router：`(tabs)` 四 Tab；`sleep/`、`breathe/`、`meditate/` 等 Stack。
- `components/` — 可复用 UI（如 SoundCard、播放器控件、计时器、呼吸圆等）。
- `hooks/` — `useAudioPlayer`、`useCountdown`、`useSounds`、`useAppStateFocusGuard` 等。
- `services/` — `soundsApi` 等网络层。
- `types/` — `sound`、`meditation`、`breathing` 等完整 TS 类型。
- `constants/` — `theme`、`breathingModes`、`meditationSessions`。

### 4.1 音频与全局状态

- **同一时间仅一段音频**；切换曲目须停止上一段。
- **页面切换**不得无故叠加多路播放；离开页面须符合 `SPEC.md` 中的停止/同步策略。
- 建议至少维护：`SPEC.md`「状态管理」所列字段（当前音频、播放类型 sleep/focus/alarm/none、播放/加载/错误、睡眠与专注与呼吸与冥想相关状态）。

### 4.2 网络与列表 UI

- 远程列表：**避免不当缓存**导致数据长期不更新（请求策略、缓存头或强制刷新需在实现上可追溯）。
- 列表与封面：**1:1**、`cover` 为空用占位；图片区域与展示一致（裁剪填充）。

### 4.3 UI / UX

- 潮汐类气质：安静、沉浸、克制；**非营销落地页**，首屏即功能。
- 深色与自然色、柔和渐变；圆角、间距、字体层级统一；按钮状态清晰。
- 适配 Android 状态栏与导航栏；预留 iPhone 安全区与底部指示条空间。
- 视觉参考可结合团队约定的 **UI-UX-Pro-Max** 技能或设计规范（若有）。

---

## 5. Agent 工作方式

1. **先读** `SPEC.md` 中与当前任务相关的章节，再改代码。
2. **最小改动**：只改满足任务所需的文件与逻辑；不删无关功能、不做无关大重构。
3. **交付可运行**：每次合并或交付节点须保证前后端/客户端可启动（本客户端即 Expo 可运行）。
4. **变更日志**：每次交付在**独立日志文件**中记录新增/修改文件与页面（文件名由项目约定，如 `CHANGELOG-session.md` 或团队指定路径）。
5. **静态页面不够**：核心交互（按钮、计时器、音频、加载/错误）必须真实可用。
6. **导航**：Expo Router；Android 返回键行为合理，且不破坏音频状态（见 `SPEC.md`）。

---

## 6. 质量门禁（建议脚本）

`package.json` 建议具备并可 CI 使用：

- `npm run start`
- `npm run android`（或项目选用的 Expo 运行命令）
- `npm run lint`
- `npm run typecheck`

TypeScript 应无明显类型错误；新增逻辑优先补测试或可被自动化验证的步骤（若仓库已有测试框架）。

---

## 7. 与 SPEC 的分工

| 文件 | 职责 |
|------|------|
| **AGENTS.md（本文）** | 环境、栈、目录、音频/网络约定、协作与质量习惯 |
| **SPEC.md** | 功能范围、API、界面与流程、验收标准 |

---

*文档日期：2026-05-12*
