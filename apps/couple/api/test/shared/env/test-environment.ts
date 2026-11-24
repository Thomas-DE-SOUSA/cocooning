import { UuidV7GeneratorProvider } from '@cocooning/server-infrastructure/identifier';
import { Uuid } from '@cocooning/shared-kernel/domain';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { TEST_AUTH_JWT_SECRET } from './test-secrets';

// The only place the E2E environment is set. DATABASE_POSTGRES_URL comes from the global setup's container.
const TEST_ENVIRONMENT = {
    PORT: '3100',
    LOG_LEVEL: 'silent',
    LOG_PRETTY: 'false',
    DB_TX_TIMEOUT_MS: '5000',
    DB_TX_MAX_WAIT_MS: '2000',
    // One fresh directory per spec file, left to the system's temporary folder.
    FILE_STORAGE_DIRECTORY: mkdtempSync(join(tmpdir(), 'cocooning-e2e-files-')),
    AUTH_JWT_SECRET: TEST_AUTH_JWT_SECRET,
    AUTH_SESSION_TTL_DAYS: '90',
    PAIRING_INVITATION_CODE_TTL_HOURS: '48',
    // The specs drive the photo prompt with PhotoPromptScheduler.tick() on the clock they move, never a timer.
    PHOTO_PROMPT_SCHEDULER_ENABLED: 'false',
} as const;

Object.assign(process.env, TEST_ENVIRONMENT);

// Jest runs this once per spec file, in the module registry of that file: main.ts does the same once per process.
Uuid.configure(new UuidV7GeneratorProvider());
