@AGENTS.md

# 理论力学 · 机构动画演示 — 网站制作全记录

## 项目概述

基于 **Next.js 16 + Tailwind CSS v4 + Three.js** 的理论力学机构运动学动画演示平台。15 个内置自包含 HTML 动画通过 `<iframe>` 嵌入，覆盖平面四杆机构、串联机器人、航天机构、工程机械、其他理论力学专题五大类别。支持 AI 运动学问答、用户上传自定义动画、双主题切换。

- 线上演示目标：Vercel 免费部署
- 用户界面：中文全量
- 动画文件：`public/animations/*.html`（内置）、`public/uploads/*.html`（上传）

## 技术栈与版本锁定

| 技术 | 版本 | 说明 |
|------|------|------|
| Next.js | 16.2.6 | App Router, Turbopack, `params` 为 Promise |
| React | 19.2.4 | 服务端/客户端组件 |
| Tailwind CSS | v4 | `@import "tailwindcss"`, `@theme inline`, 无 `tailwind.config.ts` |
| next-themes | 0.4.6 | 通过 `data-theme` 属性切换，无 `enableSystem` |
| react-hot-toast | 2.6.0 | 轻量 Toast |
| cheerio | 1.2.0 | 服务端 HTML 元数据提取 |
| TypeScript | 5.x | strict mode |
| Three.js | r150+ | 通过 unpkg CDN importmap 加载于 HTML 动画文件中 |

## 目录结构

```
website/
├── public/
│   ├── animations/          # 11 个内置自包含 Three.js HTML 文件
│   └── uploads/             # 用户上传的 HTML + covers/ 封面图片
├── src/
│   ├── app/
│   │   ├── globals.css      # ★ 主题 CSS 变量 + glass/shimmer 工具类
│   │   ├── layout.tsx       # 根布局：Providers + Header + Footer + FOUC 脚本
│   │   ├── page.tsx         # 首页：Hero + GalleryGrid
│   │   ├── error.tsx        # 全局错误页
│   │   ├── not-found.tsx    # 404 页
│   │   ├── animation/[slug]/       # ★ 动画详情页（服务端组件）
│   │   │   ├── page.tsx            # generateMetadata + 元数据展示
│   │   │   ├── actions.tsx         # "进入动画演示"按钮（'use client'）
│   │   │   └── thumbnail.tsx       # MechanismCover 容器（'use client'）
│   │   ├── watch/[slug]/           # ★ 全屏播放页
│   │   │   ├── page.tsx            # 服务端入口，获取 anim + src
│   │   │   ├── client.tsx          # 核心播放器逻辑（'use client'）
│   │   │   └── wrapper.tsx         # dynamic(()=>..., {ssr:false}) 隔离层
│   │   ├── upload/page.tsx         # 上传页
│   │   └── api/
│   │       ├── animations/route.ts        # GET → 动画列表
│   │       ├── animations/[slug]/route.ts # GET → 单个动画
│   │       ├── explain/route.ts           # POST → AI 问答
│   │       └── upload/route.ts            # POST → 文件上传+封面
│   ├── components/
│   │   ├── Providers.tsx           # ThemeProvider 客户端包装
│   │   ├── gallery/
│   │   │   ├── GalleryGrid.tsx     # 响应式网格 + 空状态
│   │   │   ├── AnimationCard.tsx   # 卡片 = MechanismCover + info → /animation/[slug]
│   │   │   ├── SearchBar.tsx       # 搜索输入
│   │   │   └── CategoryFilter.tsx  # 分类筛选按钮（彩色圆点）
│   │   ├── layout/
│   │   │   ├── Header.tsx          # 导航 + ThemeToggle
│   │   │   └── Footer.tsx
│   │   ├── viewer/
│   │   │   ├── AnimationViewer.tsx # ★ iframe 嵌入 Three.js 动画
│   │   │   ├── ViewerToolbar.tsx   # 顶栏：标题 + 停止/解释/全屏按钮
│   │   │   └── ExplainPanel.tsx    # 右侧抽屉：AI 问答面板
│   │   ├── ui/
│   │   │   ├── MechanismCover.tsx  # ★ SVG 几何机构封面插图（~320行）
│   │   │   ├── Badge.tsx           # CategoryBadge + SourceBadge
│   │   │   ├── ThemeToggle.tsx     # 日月图标按钮
│   │   │   └── Skeleton.tsx        # shimmer 骨架屏
│   │   └── upload/
│   │       └── UploadForm.tsx      # ★ 三步上传向导
│   ├── data/
│   │   └── animations.json        # 11 个内置动画元数据（含 modelDescription）
│   ├── lib/
│   │   ├── constants.ts            # CATEGORIES, PRESET_QUESTIONS, SITE_CONFIG
│   │   ├── animation-registry.ts   # 内存注册表（CRUD + 筛选 + 排序）
│   │   ├── validation.ts           # HTML 验证逻辑
│   │   ├── metadata-extractor.ts   # cheerio 元数据提取
│   │   └── ai.ts                   # AI 解释 API（调用外部 LLM）
│   └── types/
│       └── index.ts               # AnimationMeta, Category, UploadResult 等类型
├── package.json
├── tsconfig.json
└── next.config.ts
```

## 路由与导航流

```
首页 / → 动画详情页 /animation/[slug] → 全屏播放 /watch/[slug]
```

- `/` — 静态生成（SSG），展示全部动画卡片 + Hero
- `/animation/[slug]` — 动态渲染，展示元数据、模型介绍、文件信息
- `/watch/[slug]` — 动态渲染，iframe 嵌入 Three.js 动画
- `/upload` — 静态页面，三步上传向导
- `/api/animations` — GET 动画列表（支持 ?category=&search=&source=）
- `/api/animations/[slug]` — GET 单个动画元数据
- `/api/explain` — POST AI 问答
- `/api/upload` — POST 上传 HTML + 封面图片
- `/api/animations/[slug]/like` — POST 点赞（内存计数器）

已删除：`/deploy`（部署指南页面），Header 中对应导航链接已移除。

## 架构决策

### 1. iframe 隔离而非直接集成 Three.js
- 每个动画是自包含 HTML 文件（含 importmap + `<script type="module">`）
- 通过 `<iframe src={...}>` 嵌入 Next.js 页面
- **原因**：动画文件可独立分发；避免 Three.js 与 Next.js 的模块系统冲突；单个动画崩溃不影响页面

### 2. 点击播放模式（Click-to-Play）
- 首页零动画代码，缩略图为纯 SVG
- `/watch/[slug]` 通过 `dynamic(() => import('./wrapper'), { ssr: false })` 懒加载
- 进入播放页先显示静态封面，点击"播放"后才渲染 iframe
- 组件卸载时 `setPlaying(false)` → iframe 销毁，释放 GPU 资源

### 3. 服务端/客户端组件边界
- 原则：除根布局和详情页外，其余页面使用客户端组件
- `MechanismCover` 因使用 `useTheme()` 必须是 `'use client'`
- 详情页 `page.tsx` 是服务端组件，通过 `DetailThumbnail` 客户端包装渲染封面
- API routes 均为服务端（`Route Handler`）

### 4. 内存注册表（无数据库）
- `animation-registry.ts` 维护内存数组，启动时从 `animations.json` 加载
- 用户上传的动画追加到同一数组，按 source/builtin 优先、uploadDate 倒序排列
- **限制**：Vercel serverless 冷启动会丢失上传数据；生产环境应迁移至 Vercel KV/Blob

### 5. 封面系统
- 内置动画：`MechanismCover` 组件用 SVG 绘制各机构的几何线稿
- 用户上传：可选填封面图片 → 存入 `public/uploads/covers/`；未填则用几何 SVG
- 代码结构：switch(slug) → 专用渲染函数（SC/CR/SH/PJ/PL/S4/S3/DK/FF/WN/GM）
- SVG 使用 `useTheme()` 适配浅色/深色，含网格点阵背景 + 四角装饰线

## 主题系统

### CSS 变量（定义在 `globals.css`）
```css
:root {                    /* 暗色默认 */
  --background: #0a0a14;  --foreground: #cdd6f4;
  --surface: rgba(255,255,255,0.04);  --border: rgba(255,255,255,0.08);
  --accent: #4ecdc4;      --accent-fg: #000000;   --accent-hover: #3dbdb5;
  --muted: #8787a0;       --card: rgba(255,255,255,0.03);
}
html[data-theme="light"] {
  --background: #f8f6f2;  --foreground: #1a1a2e;
  --surface: rgba(255,255,255,0.85);  --border: #d4d0c8;
  --accent: #0d7377;      --accent-fg: #ffffff;   --accent-hover: #0a5f63;
  --muted: #6b6b7b;       --card: rgba(255,255,255,0.9);
}
```

### 关键设计
- `--accent-fg`：深色模式黑色文字 / 浅色模式白色文字，保证在 accent 背景上的对比度
- FOUC 防护：`<head>` 内联脚本在 React 水合前读取 localStorage 并设置 `data-theme`
- `next-themes` 配置：`attribute="data-theme" defaultTheme="dark" enableSystem={false} disableTransitionOnChange`
- `ThemeToggle.tsx` 使用 mounted 守卫避免水合不匹配

### Tailwind 映射（`@theme inline`）
```css
--color-background: var(--background);
--color-foreground: var(--foreground);
--color-surface: var(--surface);
--color-border: var(--border);
--color-accent: var(--accent);
--color-accent-fg: var(--accent-fg);
--color-accent-hover: var(--accent-hover);
--color-muted: var(--muted);
--color-card: var(--card);
```

### 工具类
- `.glass` — `bg-surface backdrop-blur-xl border border-border rounded-2xl`
- `.glass-sm` — `bg-surface backdrop-blur-md border border-border rounded-xl`
- `.animate-shimmer` — 骨架屏扫光动画
- `.animate-pulse-glow` — 播放按钮呼吸发光

## 数据流

### 动画元数据
```
animations.json ──→ animation-registry.ts (内存数组)
                         ├── getAllAnimations(filters?) → 首页 / API
                         ├── getAnimationBySlug(slug)   → 详情页 / API
                         └── addAnimation(meta)          → 上传 API
```

### 文件位置
```
─ source === 'builtin'  → /animations/{fileName}
─ source === 'uploaded' → /uploads/{fileName}
─ coverImage            → /uploads/covers/{slug}.{ext} 或 undefined
```

### 上传流程
1. 客户端校验文件扩展名、大小（≤5MB）、HTML 结构
2. cheerio 提取 `<title>`、`<meta>` 等元数据
3. 用户可补充/覆盖：title, author, institution, course, modelDescription, category, tags, cover image
4. 服务端保存 HTML → `public/uploads/`，封面图片 → `public/uploads/covers/`
5. 内存注册表追加 AnimationMeta

## 分类系统

```typescript
type Category = 'four-bar' | 'serial-robot' | 'aerospace' | 'engineering' | 'other';
```

| slug | 中文标签 | 内置动画数 | 包含 |
|------|---------|-----------|------|
| `four-bar` | 平面四杆机构 | 5 | 曲柄滑块、曲柄摇杆、牛头刨床、抽油机、平行四边形 |
| `serial-robot` | 串联机器人 | 2 | 平面4R、空间5-DOF |
| `aerospace` | 航天机构 | 2 | 空间站对接、FAST馈源舱 |
| `engineering` | 工程机械 | 3 | 卷扬机运动学、卷扬机动力学、凸轮推杆 |
| `other` | 其他 | 3 | 双摆、椭圆规、弹簧振子 + 用户上传 |

`CategoryFilter.tsx` 为每个分类配置了颜色圆点：orange(四杆) / purple(机器人) / blue(航天) / emerald(工程)。

## 关键注意事项

### Turbopack JSX 解析严格性
- **禁止**在 JSX 字符串属性中使用 `#` 后跟 `(...)`（如 `url(#arrowUp)`），Turbopack 会将 `#` 后的内容解析为错误
- 解决方案：用 `<polygon>` 替代 `<marker>` + `url(#id)` 引用
- SVG pattern ID 通过模板字符串 `` `d-${slug}` `` 保证唯一性

### Next.js 16 与旧版差异
- `params` 在 page/layout 中是 `Promise`，必须 `await`
- `next/dynamic` 的 `ssr: false` 需要包裹在 `'use client'` 组件中
- Tailwind v4 使用 `@import "tailwindcss"` 而非 `@tailwind base/components/utilities`
- `@theme inline` 在 CSS 中定义设计令牌，无需 `tailwind.config.ts`

### 硬编码颜色清理
- 全站已不再使用 `bg-[#0a0a14]`、`text-[#cdd6f4]` 等硬编码颜色
- 统一使用 Tailwind 语义类：`bg-background`、`text-foreground`、`bg-foreground/5` 等
- 仅 `globals.css` 和 `MechanismCover.tsx`（SVG 内联样式）中保留颜色定义

### 封面截图限制
- 无法通过 JS 截取跨域 iframe 内容（浏览器安全策略）
- 上传者的动画默认显示几何 SVG 封面，不上传封面图则无截图
- 替代方案：在 Three.js HTML 动画内部添加截图导出按钮

## 15 个内置动画速查

| slug | 标题 | 分类 | 关键参数 |
|------|------|------|---------|
| `slider-crank` | 曲柄滑块机构 | four-bar | r=50mm, l=200mm, λ=0.25 |
| `crank-rocker` | 曲柄摇杆机构 | four-bar | Grashof, 曲柄30/连杆100/摇杆80/机架90 |
| `shaper` | 牛头刨床急回机构 | four-bar | 曲柄100mm, 机架200mm, K=2 |
| `pumpjack` | 游梁式抽油机 | four-bar | 曲柄0.8m, 连杆3.2m, 游梁后2m前3m |
| `parallelogram` | 平行四边形机构 | four-bar | 双曲柄60mm, 连杆=机架=120mm |
| `serial-4r` | 平面串联4R机械臂 | serial-robot | 4DOF, FK/CCD-IK/Pick-and-Place |
| `serial-3d` | 空间5-DOF机械臂 | serial-robot | 1Yaw+4Pitch, CCD逆解 |
| `space-station-docking` | 空间站交会对接 | aerospace | 5阶段对接, 400km轨道 |
| `fast-feed-cabin` | FAST馈源舱 | aerospace | 六索+AB轴+Stewart, 500m口径 |
| `winch-kinematics` | 卷扬机运动学 | engineering | ω×R 匀速提升, 实时y(t)曲线 |
| `winch` | 卷扬机动力学 | engineering | 牛顿-欧拉, 扭矩/摩擦/惯量可调 |
| `cam-follower` | 凸轮推杆机构 | engineering | 偏心圆R=40mm, e=15mm, 点的合成运动 |
| `double-pendulum` | 双摆·拉格朗日方程 | other | l₁=120, l₂=100cm, RK4, 混沌/能量守恒 |
| `elliptic-trammel` | 椭圆规·瞬心法 | other | L=200mm, 椭圆轨迹, 速度合成 |
| `spring-oscillator` | 弹簧振子·振动理论 | other | m=1kg, k=40N/m, 阻尼/受迫/共振 |

每个内置动画在 `animations.json` 中均有 `author`、`course`（"理论力学"）、`modelDescription` 字段。

## 开发命令

```bash
npm run dev      # Turbopack 开发服务器 (localhost:3000)
npm run build    # 生产构建
npm run start    # 生产服务器
npm run lint     # ESLint
```

## 已知限制

1. **上传数据不持久化**：内存注册表在 Vercel serverless 冷启动时重置，需迁移至 Vercel KV/Blob
2. **上传文件 5MB 限制**：仅适用于 Vercel Hobby 计划
3. **AI 问答**：`lib/ai.ts` 默认返回预置回答（"演示模式"），需配置 `AI_API_KEY` 环境变量连接真实 LLM
4. **iframe 截图不可行**：跨域限制，参见"关键注意事项"
5. **封面图片无尺寸限制/无压缩**：生产环境应添加 sharp 压缩
