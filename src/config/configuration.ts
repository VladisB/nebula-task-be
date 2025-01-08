export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    name: process.env.DATABASE_NAME,
  },
  google: {
    keyFile: process.env.GOOGLE_KEY_FILE || 'path/to/service-account.json',
    scopes: ['https://www.googleapis.com/auth/drive'],
  },
});