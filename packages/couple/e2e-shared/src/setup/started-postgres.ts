import type { StartedPostgres } from '../containers/postgres.container';

// Jest loads globalSetup and globalTeardown as separate modules: only globalThis is shared between them.
type GlobalWithPostgres = typeof globalThis & {
    cocooningE2ePostgres?: StartedPostgres;
};

export function rememberStartedPostgres(postgres: StartedPostgres): void {
    (globalThis as GlobalWithPostgres).cocooningE2ePostgres = postgres;
}

export function takeStartedPostgres(): StartedPostgres {
    const holder = globalThis as GlobalWithPostgres;
    const postgres = holder.cocooningE2ePostgres;
    if (postgres === undefined) {
        throw new Error('No Postgres container started by the global setup');
    }
    delete holder.cocooningE2ePostgres;
    return postgres;
}
