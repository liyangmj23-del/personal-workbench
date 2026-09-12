"""
把一段书籍/文章文本喂给 Claude，按 templates/person-note-template.md 的结构
抽取成一篇人物笔记，写进 vault-data/ 对应目录。

用法:
    python scripts/extract_book_to_kg.py <文本文件路径> --person "沃伦·巴菲特" --category kg
    python scripts/extract_book_to_kg.py <文本文件路径> --person "某公司CEO" --category industry

需要环境变量 ANTHROPIC_API_KEY。
"""
import argparse
import os
from pathlib import Path

import anthropic

ROOT = Path(__file__).resolve().parent.parent
TEMPLATE_PATH = ROOT / "templates" / "person-note-template.md"

CATEGORY_DIRS = {
    "kg": ROOT / "vault-data" / "炒股知识图谱" / "人物",
    "industry": ROOT / "vault-data" / "行业观察" / "人物",
}


def build_prompt(text, person, template):
    return f"""你是一个笔记整理助手。下面是一段原文，主要涉及人物「{person}」。
请严格按照下面的模板结构，把原文中和「{person}」相关的核心观点、方法论、经典案例/经历、关联人物提炼出来，
写成一篇 Markdown 笔记。只输出笔记正文本身，不要额外解释或前后缀。

模板结构：
{template}

原文：
{text}
"""


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("text_file", help="书籍/文章文本文件路径")
    parser.add_argument("--person", required=True, help="人物姓名")
    parser.add_argument("--category", choices=["kg", "industry"], default="kg")
    args = parser.parse_args()

    text = Path(args.text_file).read_text(encoding="utf-8")
    template = TEMPLATE_PATH.read_text(encoding="utf-8")

    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    message = client.messages.create(
        model="claude-sonnet-5",
        max_tokens=4096,
        messages=[{"role": "user", "content": build_prompt(text, args.person, template)}],
    )
    note = message.content[0].text

    out_dir = CATEGORY_DIRS[args.category]
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"{args.person}.md"
    out_path.write_text(note, encoding="utf-8")
    print(f"已写入: {out_path}")


if __name__ == "__main__":
    main()
