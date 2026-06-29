CREATE TABLE "planner_states" (
	"user_id" text PRIMARY KEY,
	"email" text,
	"state" jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
