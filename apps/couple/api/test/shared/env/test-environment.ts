import { UuidV7GeneratorProvider } from '@cocooning/server-infrastructure/identifier';
import { Uuid } from '@cocooning/shared-kernel/domain';
import { TEST_AUTH_JWT_SECRET } from './test-secrets';

// The only place the E2E environment is set. DATABASE_POSTGRES_URL comes from the global setup's container.
const TEST_ENVIRONMENT = {
    PORT: '3100',
    LOG_LEVEL: 'silent',
    LOG_PRETTY: 'false',
    DB_TX_TIMEOUT_MS: '5000',
    DB_TX_MAX_WAIT_MS: '2000',
    AUTH_JWT_SECRET: TEST_AUTH_JWT_SECRET,
    PAIRING_INVITATION_CODE_TTL_HOURS: '48',
} as const;

Object.assign(process.env, TEST_ENVIRONMENT);

// Jest runs this once per spec file, in the module registry of that file: main.ts does the same once per process.
Uuid.configure(new UuidV7GeneratorProvider());
