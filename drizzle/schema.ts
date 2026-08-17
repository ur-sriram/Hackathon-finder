import { boolean, index, int, mediumtext, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: varchar("role", { length: 16 }).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const events = mysqlTable("events", {
  id: int("id").autoincrement().primaryKey(),
  sourceId: varchar("sourceId", { length: 128 }).notNull(),
  startDate: varchar("startDate", { length: 80 }).notNull(),
  eventName: text("eventName").notNull(),
  eventType: varchar("eventType", { length: 255 }).notNull(),
  organizer: text("organizer").notNull(),
  endDate: varchar("endDate", { length: 80 }).notNull(),
  eventUrl: varchar("eventUrl", { length: 1024 }),
  sourceUrl: varchar("sourceUrl", { length: 1024 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  lastSeenAt: timestamp("lastSeenAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  sourceIdUnique: uniqueIndex("events_source_id_unique").on(table.sourceId),
  activeIndex: index("events_active_index").on(table.isActive),
}));

export const refreshJobs = mysqlTable("refresh_jobs", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 120 }).notNull().unique(),
  scheduleCronTaskUid: varchar("scheduleCronTaskUid", { length: 65 }),
  lastRunAt: timestamp("lastRunAt"),
  lastSuccessAt: timestamp("lastSuccessAt"),
  lastError: text("lastError"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  taskUidIndex: index("refresh_jobs_task_uid_index").on(table.scheduleCronTaskUid),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export const apiSources = mysqlTable("api_sources", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 80 }).notNull().unique(),
  name: varchar("name", { length: 160 }).notNull(),
  sourceUrl: varchar("sourceUrl", { length: 1024 }).notNull(),
  rowSelector: varchar("rowSelector", { length: 255 }).default("table tr").notNull(),
  fieldMap: text("fieldMap").notNull(),
  lastPreviewJson: mediumtext("lastPreviewJson"),
  lastFetchedAt: timestamp("lastFetchedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;
export type ApiSource = typeof apiSources.$inferSelect;
export type InsertApiSource = typeof apiSources.$inferInsert;
