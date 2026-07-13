import "dotenv/config";

import pool from "./config/db.js";
import { getAIContext } from "./services/context.service.js";

const result = await pool.query(`
    SELECT DISTINCT user_id
    FROM platforms
    LIMIT 1
`);

const userId = result.rows[0].user_id;

console.log("Testing User:", userId);

const context = await getAIContext(userId);

console.log(JSON.stringify(context, null, 2));