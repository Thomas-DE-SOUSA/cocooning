import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { PostgreSqlContainer } from '@testcontainers/postgresql';

const POSTGRES_IMAGE = 'postgres:17-alpine';
const TEST_DATABASE = 'cocooning_test';
const TEST_CREDENTIAL = 'test';

export type StartedPostgres = {
    readonly databaseUrl: string;
    readonly stop: () => Promise<void>;
};

const couplePrismaPath = (): string =>
    path.dirname(require.resolve('@cocooning/couple-prisma/package.json'));

function deployMigrations(databaseUrl: string): void {
    execFileSync('pnpm', ['exec', 'prisma', 'migrate', 'deploy'], {
        cwd: couplePrismaPath(),
        env: { ...process.env, DATABASE_POSTGRES_URL: databaseUrl },
        stdio: 'pipe',
    });
}

export async function startMigratedPostgres(): Promise<StartedPostgres> {
    const container = await new PostgreSqlContainer(POSTGRES_IMAGE)
        .withDatabase(TEST_DATABASE)
        .withUsername(TEST_CREDENTIAL)
        .withPassword(TEST_CREDENTIAL)
        .start();
    const databaseUrl = container.getConnectionUri();
    try {
        deployMigrations(databaseUrl);
    } catch (error) {
        await container.stop();
        throw error;
    }
    return {
        databaseUrl,
        stop: async () => {
            await container.stop();
        },
    };
}
