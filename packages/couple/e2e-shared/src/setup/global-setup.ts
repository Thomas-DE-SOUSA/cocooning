import { startMigratedPostgres } from '../containers/postgres.container';
import { rememberStartedPostgres } from './started-postgres';

// Jest workers are forked after the global setup: they inherit the URL through the environment.
export default async function globalSetup(): Promise<void> {
    const postgres = await startMigratedPostgres();
    process.env['DATABASE_POSTGRES_URL'] = postgres.databaseUrl;
    rememberStartedPostgres(postgres);
}
