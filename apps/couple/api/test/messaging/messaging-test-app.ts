import type { INestApplication } from '@nestjs/common';
import {
    createTestAccount,
    createTestCouple,
    truncateAllTables,
} from '@cocooning/couple-e2e-shared/fixtures';
import { PrismaService } from '@cocooning/couple-prisma/nest';
import { DateTimeProvider, FileStorage } from '@cocooning/shared-kernel/ports';
import { DeterministicDateTimeProvider } from '@cocooning/shared-kernel/testing';
import { closeTestApp, createTestApp } from '../shared/app/create-test-app';
import { TestClient } from '../shared/app/test-client';
import { MessagingRequests } from './messaging-requests';
import { COUPLES, NOW, PARTNERS, partnerAccount } from './messaging-test-data';

// The real AppModule on a clock the spec moves; reset() seeds the accounts and the two formed couples.
export class MessagingTestApp extends MessagingRequests {
    readonly clock = new DeterministicDateTimeProvider(NOW);
    private app: INestApplication | null = null;
    private client: TestClient | null = null;

    get prisma(): PrismaService {
        return this.started().app.get(PrismaService);
    }

    get fileStorage(): FileStorage {
        return this.started().app.get(FileStorage);
    }

    async start(): Promise<void> {
        const app = await createTestApp({
            controllers: [],
            overrides: [{ provide: DateTimeProvider, useValue: this.clock }],
        });
        this.app = app;
        this.client = await TestClient.for(app);
    }

    async stop(): Promise<void> {
        await closeTestApp(this.started().app);
    }

    async reset(): Promise<void> {
        this.clock.setNow(NOW);
        await truncateAllTables(this.prisma);
        await Promise.all([
            ...PARTNERS.map((userId) =>
                createTestAccount(this.prisma, partnerAccount(userId)),
            ),
            ...COUPLES.map((couple) => createTestCouple(this.prisma, couple)),
        ]);
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
