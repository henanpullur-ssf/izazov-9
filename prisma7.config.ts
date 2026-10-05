import "dotenv/config";
import { defineConfig } from "prisma/config";

console.log(
  "PRISMA CONFIG DB URL:",
  process.env.DATABASE_URL ? "FOUND" : "MISSING"
);

export default defineConfig({
  schema: "prisma/schema.prisma",

  migrations: {
    path: "prisma/migrations",
  },

  datasource: {
    url: process.env.DATABASE_URL!,
  },
});