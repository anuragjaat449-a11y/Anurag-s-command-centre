import type { Config } from "@netlify/functions";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { plannerStates } from "../../db/schema.js";

export default async (req: Request) => {
  // CORS headers and preflight handling
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers,
    });
  }

  const userId = authHeader.substring(7);

  if (req.method === "GET") {
    try {
      const records = await db
        .select()
        .from(plannerStates)
        .where(eq(plannerStates.userId, userId));

      if (records.length === 0) {
        return new Response(JSON.stringify({ state: null }), {
          status: 200,
          headers,
        });
      }

      return new Response(JSON.stringify({ state: records[0].state }), {
        status: 200,
        headers,
      });
    } catch (err: any) {
      console.error("Database fetch error:", err);
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers,
      });
    }
  }

  if (req.method === "POST") {
    try {
      const { email, state } = await req.json();
      if (!state) {
        return new Response(JSON.stringify({ error: "Missing state in payload" }), {
          status: 400,
          headers,
        });
      }

      // Upsert the state
      await db
        .insert(plannerStates)
        .values({
          userId,
          email: email || null,
          state,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: plannerStates.userId,
          set: {
            email: email || null,
            state,
            updatedAt: new Date(),
          },
        });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers,
      });
    } catch (err: any) {
      console.error("Database save error:", err);
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers,
      });
    }
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers,
  });
};

export const config: Config = {
  path: "/api/planner",
};
