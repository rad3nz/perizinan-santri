import { migrate } from "drizzle-orm/mysql2/migrator";
import { db, pool } from "./client";

await migrate(db, { migrationsFolder: "./drizzle" });
console.log("Migrasi selesai.");
await pool.end();
