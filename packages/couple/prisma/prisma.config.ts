import { defineConfig } from 'prisma/config';

const url = process.env['DATABASE_POSTGRES_URL'];

// `prisma generate` needs no database: the URL is required only by the commands that connect.
export default defineConfig({
    schema: 'prisma',
    migrations: { path: 'prisma/migrations' },
    ...(url === undefined ? {} : { datasource: { url } }),
});
