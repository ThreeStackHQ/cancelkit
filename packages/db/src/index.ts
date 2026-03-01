export { db } from "./client";
export type { Database } from "./client";
export * from "./schema";

// Re-export drizzle helpers for consumers
export { eq, and, or, desc, asc, sql, inArray, isNull, isNotNull } from "drizzle-orm";
