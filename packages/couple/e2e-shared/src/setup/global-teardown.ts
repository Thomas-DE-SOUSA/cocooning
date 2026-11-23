import { takeStartedPostgres } from './started-postgres';

export default async function globalTeardown(): Promise<void> {
    await takeStartedPostgres().stop();
}
