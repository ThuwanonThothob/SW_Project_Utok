import "dotenv/config";
import app from "./app.js";
import { databaseStatus, pool } from "./config/database.js";

const port = Number(process.env.PORT || 4000);
const server = app.listen(port, async () => {
  const database = await databaseStatus();
  console.log(`UTOK API: http://localhost:${port}`);
  console.log(`Data mode: ${database.mode}${database.connected ? "" : " (disconnected)"}`);
});

async function shutdown(signal) {
  console.log(`${signal}: shutting down`);
  server.close(async () => {
    if (pool) await pool.end();
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
