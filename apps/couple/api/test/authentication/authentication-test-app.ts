import type { INestApplication } from '@nestjs/common';
import {
    createTestAccount,
    truncateAllTables,
} from '@cocooning/couple-e2e-shared/fixtures';
import { PrismaService } from '@cocooning/couple-prisma/nest';
import { PasswordHasher } from '@cocooning/couple-server-business-logic/authentication';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { DateTimeProvider } from '@cocooning/shared-kernel/ports';
import { DeterministicDateTimeProvider } from '@cocooning/shared-kernel/testing';
import { closeTestApp, createTestApp } from '../shared/app/create-test-app';
import { TestClient, type TestResponse } from '../shared/app/test-client';
import {
    MILLISECONDS_PER_DAY,
    NOW,
    PASSWORD,
} from './authentication-test-data';
import {
    PartnerProbeController,
    PROBE_ROUTE,
} from './partner-probe.controller';

// The real AppModule on a clock the spec moves, with the probe route to prove a session opens a private route.
export class AuthenticationTestApp {
    readonly clock = new DeterministicDateTimeProvider(NOW);
    private app: INestApplication | null = null;
    private client: TestClient | null = null;

    get nestApp(): INestApplication {
        return this.started().app;
    }

    get prisma(): PrismaService {
        return this.started().app.get(PrismaService);
    }

    async start(): Promise<void> {
        const app = await createTestApp({
            controllers: [PartnerProbeController],
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
    }

    advanceDays(days: number): void {
        this.clock.advanceBy(days * MILLISECONDS_PER_DAY);
    }

    // Hashed by the real adapter, so that sign-in checks a true Argon2id hash.
    async givenAccount(
        accountId: string,
        emailAddress: string,
        sessionVersion = 1,
    ): Promise<void> {
        const hasher = this.started().app.get(PasswordHasher);
        await createTestAccount(this.prisma, {
            accountId,
            emailAddress,
            passwordHash: await hasher.hash(PASSWORD),
            sessionVersion,
            createdAt: NOW,
            deletedAt: null,
        });
    }

    unauthenticated(): TestClient {
        return this.started().client.unauthenticated();
    }

    withSessionToken(token: string): TestClient {
        return this.started().client.withSessionToken(token);
    }

    signIn(emailAddress: string, password = PASSWORD): Promise<TestResponse> {
        return this.unauthenticated().post(ApiRouterEnum.ACCOUNT_SESSION_OPEN, {
            emailAddress,
            password,
        });
    }

    signOut(token: string): Promise<TestResponse> {
        return this.withSessionToken(token).delete(
            ApiRouterEnum.ACCOUNT_SESSION_CLOSE,
        );
    }

    probe(token: string): Promise<TestResponse> {
        return this.withSessionToken(token).get(PROBE_ROUTE);
    }

    private started(): { app: INestApplication; client: TestClient } {
        if (this.app === null || this.client === null) {
            throw new Error('AuthenticationTestApp used before start()');
        }
        return { app: this.app, client: this.client };
    }
}
