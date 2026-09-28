import { relations } from "drizzle-orm"
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core"
import type { AdapterAccountType } from "next-auth/adapters"

export const roleEnum = pgEnum("role", ["admin", "farmer", "viewer"])

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date", withTimezone: true }),
  image: text("image"),
  passwordHash: text("password_hash"),
  role: roleEnum("role").notNull().default("farmer"),
  provider: text("provider"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
)

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date", withTimezone: true }).notNull(),
})

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date", withTimezone: true }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
)

export const greenhouses = pgTable("greenhouses", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  location: text("location"),
  areaM2: real("area_m2"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const sensorReadings = pgTable(
  "sensor_readings",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    greenhouseId: text("greenhouse_id")
      .notNull()
      .references(() => greenhouses.id, { onDelete: "cascade" }),
    temperature: real("temperature"),
    humidity: real("humidity"),
    soilMoisture: real("soil_moisture"),
    lightLux: real("light_lux"),
    co2Ppm: real("co2_ppm"),
    recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    recordedAtIdx: index("sensor_readings_recorded_at_idx").on(t.recordedAt),
    greenhouseIdx: index("sensor_readings_greenhouse_idx").on(t.greenhouseId),
  })
)

export const blogPosts = pgTable(
  "blog_posts",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    authorId: text("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    titleTr: text("title_tr").notNull(),
    titleEn: text("title_en").notNull(),
    excerptTr: text("excerpt_tr"),
    excerptEn: text("excerpt_en"),
    bodyTr: text("body_tr").notNull(),
    bodyEn: text("body_en").notNull(),
    coverImage: text("cover_image"),
    published: boolean("published").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => ({
    slugIdx: uniqueIndex("blog_posts_slug_idx").on(t.slug),
    publishedIdx: index("blog_posts_published_idx").on(t.published),
  })
)

export const contactMessages = pgTable("contact_messages", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export type PricingFeature = {
  tr: string
  en: string
  included: boolean
}

export const pricingPlans = pgTable("pricing_plans", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  nameKey: text("name_key").notNull(),
  descriptionKey: text("description_key").notNull(),
  priceMonthly: real("price_monthly").notNull(),
  priceYearly: real("price_yearly").notNull(),
  features: jsonb("features").$type<PricingFeature[]>().notNull().default([]),
  highlighted: boolean("highlighted").notNull().default(false),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  greenhouses: many(greenhouses),
  blogPosts: many(blogPosts),
}))

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}))

export const greenhousesRelations = relations(greenhouses, ({ one, many }) => ({
  user: one(users, { fields: [greenhouses.userId], references: [users.id] }),
  readings: many(sensorReadings),
}))

export const sensorReadingsRelations = relations(sensorReadings, ({ one }) => ({
  greenhouse: one(greenhouses, {
    fields: [sensorReadings.greenhouseId],
    references: [greenhouses.id],
  }),
}))

export const blogPostsRelations = relations(blogPosts, ({ one }) => ({
  author: one(users, { fields: [blogPosts.authorId], references: [users.id] }),
}))

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Greenhouse = typeof greenhouses.$inferSelect
export type NewGreenhouse = typeof greenhouses.$inferInsert
export type SensorReading = typeof sensorReadings.$inferSelect
export type NewSensorReading = typeof sensorReadings.$inferInsert
export type BlogPost = typeof blogPosts.$inferSelect
export type NewBlogPost = typeof blogPosts.$inferInsert
export type ContactMessage = typeof contactMessages.$inferSelect
export type NewContactMessage = typeof contactMessages.$inferInsert
export type PricingPlan = typeof pricingPlans.$inferSelect
export type NewPricingPlan = typeof pricingPlans.$inferInsert
