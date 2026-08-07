import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const chatThread = pgTable(
  "chat_thread",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("chat_thread_userId_idx").on(table.userId)]
);

export const chatMessage = pgTable(
  "chat_message",
  {
    id: text("id").primaryKey(),
    threadId: text("thread_id")
      .notNull()
      .references(() => chatThread.id, { onDelete: "cascade" }),
    role: text("role").notNull(), // 'user' | 'assistant'
    content: text("content").notNull(),
    model: text("model"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("chat_message_threadId_idx").on(table.threadId)]
);

export const generatedImage = pgTable(
  "generated_image",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    prompt: text("prompt").notNull(),
    style: text("style"),
    imageUrl: text("image_url").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("generated_image_userId_idx").on(table.userId)]
);

export const chatThreadRelations = relations(chatThread, ({ one, many }) => ({
  user: one(user, {
    fields: [chatThread.userId],
    references: [user.id],
  }),
  messages: many(chatMessage),
}));

export const chatMessageRelations = relations(chatMessage, ({ one }) => ({
  thread: one(chatThread, {
    fields: [chatMessage.threadId],
    references: [chatThread.id],
  }),
}));

export const generatedImageRelations = relations(generatedImage, ({ one }) => ({
  user: one(user, {
    fields: [generatedImage.userId],
    references: [user.id],
  }),
}));
