# Personal Workbench

一个本地优先（local-first）、开源的个人知识工作台。用来把"记账、读书笔记、投资知识图谱、行业人物观察"这几件事整合到同一套工具链里，本地跑，也能通过 Git 同步到多台设备。

## 这是什么

四个模块，共用同一个笔记基座（[Logseq](https://github.com/logseq/logseq)，纯 Markdown + 双向链接）：

1. **记账 & 持仓看板** — [beancount](https://beancount.github.io/) + [Fava](https://github.com/beancount/fava)，纯文本账本，本地起一个网页看板
2. **读书笔记** — 日常读书笔记，存在 Logseq graph 里
3. **投资知识图谱** — 把投资类书籍拆解成"人物笔记"（核心观点/方法论/案例/关联人物），用 `[[双向链接]]` 模拟知识图谱，配一个 LLM 抽取脚本批量生成
4. **行业人物观察** — 用 [Karakeep](https://github.com/karakeep-app/karakeep) 抓取社交媒体/媒体上的言论和访谈，LLM 提炼后写成同款"人物笔记"

## 架构：代码开源，数据私有

这个仓库（`personal-workbench`）只包含**代码、脚本、模板、配置**，**不包含任何真实的笔记或账本数据**。

真实数据全部落在 `vault-data/` 目录下——这个目录被 `.gitignore` 排除，从未进入过本仓库的 git 历史。它应该是**你自己另外 `git init` 的一个独立仓库**（建议私有），指向你自己的 GitHub 私有仓库。

```
personal-workbench/          ← 本仓库（公开，开源代码）
└── vault-data/              ← 你的数据（本仓库看不到，自己另建私有仓库）
    ├── 读书笔记/
    ├── 炒股知识图谱/人物/
    ├── 行业观察/人物/
    └── finance/
        └── ledger.beancount
```

**如果你 fork 这个项目自己用**：`vault-data/` 目录是空的，把你自己的 Logseq graph / beancount 账本放进去即可，不会和作者的数据有任何交集。

## 快速开始

1. 安装 [Logseq](https://logseq.com/) 桌面客户端，打开 `vault-data/` 作为 graph
2. `pip install -r requirements.txt`，运行 `python scripts/beancount_init.py` 生成初始账本
3. `fava vault-data/finance/ledger.beancount` 本地打开记账看板
4. 复制 `.env.example` 为 `.env`，填入自己的 Claude API Key
5. `docker compose up -d` 启动 Karakeep（行业人物内容采集）
6. `python scripts/extract_book_to_kg.py <书籍文本路径>` 把一本书抽取成人物笔记

## 目录结构

```
personal-workbench/
├── docker-compose.yml       Karakeep 等自托管服务
├── .env.example             环境变量示例（真实 .env 不进 git）
├── config.example.yaml      数据目录等配置示例
├── scripts/                 各类自动化脚本
├── templates/               笔记模板
└── vault-data/              你的数据（.gitignore 排除）
```

## License

MIT
