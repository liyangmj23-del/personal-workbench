"""
提交并推送 vault-data/ 这个独立的私有仓库。
用法: python scripts/sync_data_repo.py "commit message"
"""
import subprocess
import sys
from pathlib import Path

VAULT_DIR = Path(__file__).resolve().parent.parent / "vault-data"


def run(*args):
    subprocess.run(args, cwd=VAULT_DIR, check=True)


def main():
    message = sys.argv[1] if len(sys.argv) > 1 else "sync"
    run("git", "add", "-A")
    result = subprocess.run(["git", "diff", "--cached", "--quiet"], cwd=VAULT_DIR)
    if result.returncode == 0:
        print("没有改动，跳过")
        return
    run("git", "commit", "-m", message)
    run("git", "push")


if __name__ == "__main__":
    main()
