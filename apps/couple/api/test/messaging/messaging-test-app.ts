import type { INestApplication } from '@nestjs/common';
import {
    createTestAccount,
    createTestCouple,
    truncateAllTables,
} from '@cocooning/couple-e2e-shared/fixtures';
import { PrismaService } from '@cocooning/couple-prisma/nest';
import {
    DateTimeProvider,
    FileStorage,
    SecureRandomGenerator,
} from '@cocooning/shared-kernel/ports';
import {
    DeterministicDateTimeProvider,
    FakeSecureRandomGenerator,
} from '@cocooning/shared-kernel/testing';
import {
    PushNotificationSender,
    RelayOutboxEventsUseCase,
} from '@cocooning/couple-server-business-logic/messaging';
import {
    OutboxRelayScheduler,
    PhotoPromptScheduler,
} from '../../src/modules/messaging/primary/scheduler';
import { closeTestApp, createTestApp } from '../shared/app/create-test-app';
import { TestClient } from '../shared/app/test-client';
import { FakePushNotificationSender } from './fake-push-notification-sender';
import { MessagingRequests } from './messaging-requests';
import {
    COUPLES,
    NOW,
    PARTNER_A,
    PARTNERS,
    partnerAccount,
    TEN_AM_MINUTE,
    todayPhotoPromptOf,
} from './messaging-test-data';

// The real AppModule on a clock the spec moves and a random port it sets; reset() seeds the accounts and the two formed couples.
export class MessagingTestApp extends MessagingRequests {
    readonly clock = new DeterministicDateTimeProvider(NOW);
    readonly random = new FakeSecureRandomGenerator();
    readonly pushSender = new FakePushNotificationSender();
    private app: INestApplication | null = null;
    private client: TestClient | null = null;

    get prisma(): PrismaService {
        return this.started().app.get(PrismaService);
    }

    get fileStorage(): FileStorage {
        return this.started().app.get(FileStorage);
    }

    // A provider of the running app, such as a repository tested through it (e2e.md rule 14).
    get<T>(token: abstract new (...args: never[]) => T): T {
        return this.started().app.get(token);
    }

    async start(): Promise<void> {
        const app = await createTestApp({
            controllers: [],
            overrides: [
                { provide: DateTimeProvider, useValue: this.clock },
                { provide: SecureRandomGenerator, useValue: this.random },
                { provide: PushNotificationSender, useValue: this.pushSender },
            ],
        });
        this.app = app;
        this.client = await TestClient.for(app);
    }

    async stop(): Promise<void> {
        await closeTestApp(this.started().app);
    }

    async reset(): Promise<void> {
        this.clock.setNow(NOW);
        this.pushSender.reset();
        await truncateAllTables(this.prisma);
        await Promise.all([
            ...PARTNERS.map((userId) =>
                createTestAccount(this.prisma, partnerAccount(userId)),
            ),
            ...COUPLES.map((couple) => createTestCouple(this.prisma, couple)),
        ]);
    }

    // R7: one tick of the scheduled task, at the clock of the test app; its timer is off in the E2E environment.
    tick(): Promise<void> {
        return this.started().app.get(PhotoPromptScheduler).tick();
    }

    // R10: one tick of the outbox relay, at the clock of the test app; its timer is off in the E2E environment.
    relay(): Promise<void> {
        return this.started().app.get(OutboxRelayScheduler).tick();
    }

    // Two relays in two transactions at once, as two API processes would run them, around the scheduler's guard.
    async relayTwiceAtOnce(): Promise<void> {
        const relay = this.started().app.get(RelayOutboxEventsUseCase);
        await Promise.all([relay.execute(), relay.execute()]);
    }

    // Today's prompt of the couple of A and B, drawn at 10:00 Paris and issued now: its id.
    async issuedPhotoPromptId(): Promise<string> {
        this.random.willReturnIntegers([TEN_AM_MINUTE, TEN_AM_MINUTE]);
        await this.tick();
        const { photoPrompt } = todayPhotoPromptOf(
            await this.todayPhotoPrompt(PARTNER_A),
        );
        if (photoPrompt === null) throw new Error('photo prompt not issued');
        return photoPrompt.id;
    }

    unauthenticated(): TestClient {
        return this.started().client.unauthenticated();
    }

    override as(userId: string): TestClient {
        return this.started().client.asPartner(userId, this.clock.now());
    }

    private started(): { app: INestApplication; client: TestClient } {
        if (this.app === null || this.client === null) {
            throw new Error('MessagingTestApp used before start()');
        }
        return { app: this.app, client: this.client };
    }
}
