import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core";

export const plannerStates = pgTable("planner_states", {
  userId: text("user_id").primaryKey(),
  email: text("email"),
  state: jsonb("state").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
