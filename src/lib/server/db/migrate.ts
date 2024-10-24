import "dotenv/config";
import {drizzle} from "drizzle-orm/better-sqlite3";
import {db} from "./index";
migrate(db);
