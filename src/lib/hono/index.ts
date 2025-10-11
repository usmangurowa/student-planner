import { Hono } from "hono";
import { hc } from "hono/client";

import { env } from "../env";
export const app = new Hono()
  .basePath("/api")
  .get("/", (c) => c.text("Hello World"));

export type Client = ReturnType<typeof hc<typeof app>>;

export const hcWithType = (...args: Parameters<typeof hc>): Client =>
  hc<typeof app>(...args);

export const client = hcWithType(`${env.VERCEL_URL}/api`);
