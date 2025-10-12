import 'dotenv/config';

import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

if (process.env.NODE_ENV === 'development') {
  neonConfig.fetchEndpoint = 'http://neon-local:5342/sql';
  neonConfig.useSecureWebSocket = false;
  neonConfig.poolQueryViaFetch = true;
}
if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is not set. Configure it in your environment (.env.development/.env.production) or compose file.'
  );
}
const sql = neon(
  'postgres://avnadmin:AVNS_dBb4LAL-fSoPJ6VHxlY@pg-1436270b-aimankhelif1-1b1a.h.aivencloud.com:22606/defaultdb?sslmode=require'
);

const db = drizzle(sql);

export { db, sql };
