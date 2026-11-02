import dotenv from "dotenv";
import path from "node:path";

// Load the project-root .env (shared with woody-client) by absolute path,
// so it works no matter which directory the process is started from.
dotenv.config({ path: path.join(import.meta.dirname, "../../../.env") });
