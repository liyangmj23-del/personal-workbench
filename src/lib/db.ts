import path from "node:path";
import { PrismaClient } from "@/generated/prisma/client";

// SQLite的相对路径解析在 `prisma migrate` 和 Next.js runtime 下不一致，
// 这里显式用绝对路径（相对项目根目录 data/workbench.db），避免build/运行时找不到数据库文件。
const dbPath = path.join(process.cwd(), "data", "workbench.db");

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: `file:${dbPath}`,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
