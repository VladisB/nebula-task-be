export default () => ({
  app: {
    port: parseInt(process.env.PORT, 10) || 3000,
    nodeEnv: process.env.NODE_ENV
  },
  database: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    name: process.env.DATABASE_NAME,
    type: process.env.DB_TYPE
  },
  google: {
    keyFile: process.env.GOOGLE_KEY_FILE, // File path
    scopes: ['https://www.googleapis.com/auth/drive'], // TODO: Check it
  },
});