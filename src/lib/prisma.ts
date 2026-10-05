import { PrismaClient, Prisma } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Retry transient connection errors.
 *
 * Neon (serverless Postgres) can drop idle pooled connections, surfacing as
 * Prisma error codes P1001 (can't reach server) or P1002 (timed out). These
 * almost always succeed on an immediate retry once a fresh connection is made.
 */
const RETRIABLE_ERRORS = ["P1001", "P1002", "P1006", "P1008", "P5009"];

/**
 * Run a Prisma operation, retrying on transient connection failures.
 *
 * @example
 * const people = await withRetry(() => prisma.person.findMany());
 */
export async function withRetry<T>(operation: () => Promise<T>, retries = 2): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const code = (error as { code?: string })?.code;
    const retriable = RETRIABLE_ERRORS.includes(code ?? "");
    if (retriable && retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return withRetry(operation, retries - 1);
    }
    throw error;
  }
}
