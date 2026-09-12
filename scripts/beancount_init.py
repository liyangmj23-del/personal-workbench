"""生成一个空的 beancount 初始账本骨架。不含任何真实数字，跑完自己去改。"""
from pathlib import Path

LEDGER_PATH = Path(__file__).resolve().parent.parent / "vault-data" / "finance" / "ledger.beancount"

TEMPLATE = '''option "title" "个人账本"
option "operating_currency" "CNY"

2026-01-01 open Assets:Cash:Alipay CNY
2026-01-01 open Assets:Cash:WeChat CNY
2026-01-01 open Assets:Cash:Bank CNY
2026-01-01 open Assets:Investments:Funds CNY
2026-01-01 open Assets:Investments:Stocks CNY

2026-01-01 open Income:Salary CNY
2026-01-01 open Income:Investment CNY

2026-01-01 open Expenses:Housing CNY
2026-01-01 open Expenses:Food CNY
2026-01-01 open Expenses:Transport CNY
2026-01-01 open Expenses:Other CNY

2026-01-01 open Equity:Opening-Balances CNY

; 示例交易，只是用来验证 fava 能跑起来，确认之后把这条删掉换成真实记录
2026-01-01 * "示例" "起始余额，改成自己的真实数字"
  Assets:Cash:Alipay        0.00 CNY
  Equity:Opening-Balances
'''


def main():
    LEDGER_PATH.parent.mkdir(parents=True, exist_ok=True)
    if LEDGER_PATH.exists():
        print(f"已存在，不覆盖: {LEDGER_PATH}")
        return
    LEDGER_PATH.write_text(TEMPLATE, encoding="utf-8")
    print(f"已生成: {LEDGER_PATH}")


if __name__ == "__main__":
    main()
