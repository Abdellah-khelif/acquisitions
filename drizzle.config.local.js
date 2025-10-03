import 'dotenv/config';

export default {
  schema: './src/models/*.js',
  out: './drizzle',
  dialect: 'postgresql',
  driver: 'pg',
  dbCredentials: {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'dev_password',
    database: 'acquisitions_dev',
  },
};