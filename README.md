# Personal Workbench

一个本地优先（local-first）、开源的个人知识工作台——一个完整的全栈 Web 应用：Next.js 前端 + 后端 API（Server Actions）+ SQLite 数据库，本地跑一个服务，浏览器打开使用。

## 这是什么

一个界面里集成四个模块：

1. **记账 & 持仓** — 账户流水记账 + 基金/股票持仓看板，自动算盈亏
2. **读书笔记** — Markdown 笔记，编辑/预览双模式
3. **知识图谱** — 把投资类书籍拆解成"人物卡"（核心观点/方法论/案例/关联人物），支持粘贴原文让 AI（Claude）辅助抽取；人物之间的关联关系用力导向图（reactflow）可视化
4. **内容采集** — 粘贴链接或文字稿，服务端抓正文（Readability）+ AI 摘要提炼，可关联到知识图谱里的人物卡

投资知识图谱和行业人物观察共用同一套"人物卡"数据结构，只是分类不同。

## 架构：代码开源，数据私有

这个仓库只包含**代码**（Next.js 源码、Prisma schema 结构），**不包含任何真实数据**。

真实数据全部落在 `data/` 目录下的一个 SQLite 文件（`workbench.db`）——这个目录被 `.gitignore` 排除，从未进入过本仓库的 git 历史，应该是你自己另外 `git init` 的一个独立仓库（建议私有）。

```
personal-workbench/     ← 本仓库（公开，开源代码）
└── data/                ← 你的数据（本仓库看不到，自己另建私有仓库）
    └── workbench.db      SQLite，记账/持仓/笔记/人物卡/采集内容全在这一个文件里
```

**如果你 fork 这个项目自己用**：`data/` 目录是空的，`npx prisma migrate dev` 会在这里生成一个全新的空数据库，不会和作者的数据有任何交集。

## 快速开始

```bash
npm install
cp .env.example .env       # 填入 ANTHROPIC_API_KEY（AI抽取/摘要功能要用，不填也能用记账/笔记模块）
npx prisma migrate dev     # 生成 data/workbench.db
npm run dev                # http://localhost:3000
```

生产运行（本地长期服务）：

```bash
npm run build
npm start
```

## 技术栈

- **Next.js（App Router）+ TypeScript** — 前端页面 + 后端（Server Actions）在同一个项目里
- **Tailwind CSS + shadcn/ui（Base UI）** — UI 组件
- **Prisma + SQLite** — 单文件数据库，零额外服务进程
- **@anthropic-ai/sdk** — 书籍摘录 → 人物卡抽取；采集内容 → 摘要提炼
- **@mozilla/readability + jsdom** — 网页正文抓取
- **reactflow** — 人物关联知识图谱可视化

## 目录结构

```
src/
├── app/                 页面 + API（Server Actions）
│   ├── finance/         记账 & 持仓
│   ├── notes/           读书笔记
│   ├── knowledge-graph/ 知识图谱
│   └── capture/         内容采集
├── components/          UI组件
└── lib/
    ├── db.ts            Prisma client
    └── actions/         各模块的 Server Actions
prisma/schema.prisma      数据模型
data/                     你的数据（.gitignore 排除）
```

## License

MIT
