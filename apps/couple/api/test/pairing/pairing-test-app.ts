import type { INestApplication } from '@nestjs/common';
import { truncateAllTables } from '@cocooning/couple-e2e-shared/fixtures';
import { PrismaService } from '@cocooning/couple-prisma/nest';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { DateTimeProvider } from '@cocooning/shared-kernel/ports';
import { DeterministicDateTimeProvider } from '@cocooning/shared-kernel/testing';
import {
    closeTestApp,
    createTestApp,
    type ProviderOverride,
} from '../shared/app/create-test-app';
import { TestClient, type TestResponse } from '../shared/app/test-client';
import { MILLISECONDS_PER_HOUR, NOW } from './pairing-test-data';

// The real AppModule on a clock the spec moves; sessions are signed at that clock.
export class PairingTestApp {
    readonly clock = new DeterministicDateTimeProvider(NOW);
    private app: INestApplication | null = null;
    private client: TestClient | null = null;

    constructor(private readonly overrides: readonly ProviderOverride[] = []) {}

    get prisma(): PrismaService {
        return this.started().app.get(PrismaService);
    }

    get nestApp(): INestApplication {
        return this.started().app;
    }

    async start(): Promise<void> {
        const app = await createTestApp({
            controllers: [],
            overrides: [
                { provide: DateTimeProvider, useValue: this.clock },
                ...this.overrides,
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
        await truncateAllTables(this.prisma);
    }

    advanceHours(hours: number): void {
        this.clock.advanceBy(hours * MILLISECONDS_PER_HOUR);
    }

    unauthenticated(): TestClient {
        return this.started().client.unauthenticated();
    }

    as(userId: string): TestClient {
        return this.started().client.asPartner(userId, this.clock.now());
    }

    createCouple(userId: string): Promise<TestResponse> {
        return this.as(userId).post(ApiRouterEnum.COUPLE_CREATE);
    }

    join(userId: string, invitationCode: string): Promise<TestResponse> {
        return this.as(userId).post(ApiRouterEnum.COUPLE_JOIN, {
            invitationCode,
        });
    }

    renew(userId: string): Promise<TestResponse> {
        return this.as(userId).post(ApiRouterEnum.COUPLE_INVITATION_CODE_RENEW);
    }

    getMine(userId: string): Promise<TestResponse> {
        return this.as(userId).get(ApiRouterEnum.COUPLE_GET_MINE);
    }

    private started(): { app: INestApplication; client: TestClient } {
        if (this.app === null || this.client === null) {
            throw new Error('PairingTestApp used before start()');
        }
        return { app: this.app, client: this.client };
    }
}
