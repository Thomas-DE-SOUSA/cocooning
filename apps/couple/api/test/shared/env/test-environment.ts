import { UuidV7GeneratorProvider } from '@cocooning/server-infrastructure/identifier';
import { Uuid } from '@cocooning/shared-kernel/domain';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
    TEST_AUTH_JWT_SECRET,
    TEST_VAPID_PRIVATE_KEY,
    TEST_VAPID_PUBLIC_KEY,
} from './test-secrets';

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
    // The specs drive the outbox relay with OutboxRelayScheduler.tick(), through a fake PushNotificationSender.
    OUTBOX_RELAY_ENABLED: 'false',
    WEB_PUSH_VAPID_PUBLIC_KEY: TEST_VAPID_PUBLIC_KEY,
    WEB_PUSH_VAPID_PRIVATE_KEY: TEST_VAPID_PRIVATE_KEY,
    WEB_PUSH_VAPID_SUBJECT: 'https://cocooning.test',
    // The specs replace the search engine, the page reader, OpenStreetMap and the AI by fakes: no network, no key.
    WEB_SEARCH_SEARXNG_URL: 'http://searxng.test',
    WEB_SEARCH_TIMEOUT_MS: '1000',
    PLACE_DIRECTORY_NOMINATIM_URL: 'http://nominatim.test',
    PLACE_DIRECTORY_TIMEOUT_MS: '1000',
    PLACE_DIRECTORY_USER_AGENT: 'Cocooning/e2e',
    NOTE_CARD_GEMINI_API_KEY: '',
    NOTE_CARD_GEMINI_MODEL: 'gemini-e2e-never-called',
    NOTE_CARD_GEMINI_FALLBACK_MODEL: 'gemini-e2e-fallback-never-called',
    NOTE_CARD_DAILY_SEARCH_LIMIT: '30',
    // The specs drive the background task with NoteCardEnrichmentScheduler.tick(), never a timer.
    NOTE_CARD_ENRICHMENT_ENABLED: 'false',
    NOTE_CARD_ENRICHMENT_INTERVAL_MS: '10000',
} as const;

Object.assign(process.env, TEST_ENVIRONMENT);

// Jest runs this once per spec file, in the module registry of that file: main.ts does the same once per process.
Uuid.configure(new UuidV7GeneratorProvider());
