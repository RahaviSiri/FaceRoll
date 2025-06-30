import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  user: "postgres",
  password: "Ravi12345",
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

export default pool;
