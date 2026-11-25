import type { INestApplication } from '@nestjs/common';
import {
    createTestAccount,
    createTestCouple,
    truncateAllTables,
} from '@cocooning/couple-e2e-shared/fixtures';
import { PrismaService } from '@cocooning/couple-prisma/nest';
import {
    NoteCardWriter,
    WebPageReader,
    WebSearchProvider,
} from '@cocooning/couple-server-business-logic/notes';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { DateTimeProvider } from '@cocooning/shared-kernel/ports';
import { DeterministicDateTimeProvider } from '@cocooning/shared-kernel/testing';
import { closeTestApp, createTestApp } from '../shared/app/create-test-app';
import { TestClient, type TestResponse } from '../shared/app/test-client';
import { FakeNoteCardWriter } from './fake-note-card-writer';
import { FakeWebPageReader, FakeWebSearchProvider } from './fake-web-search';
import {
    COUPLES,
    noteOf,
    NOW,
    PARTNERS,
    partnerAccount,
} from './notes-test-data';

const MILLISECONDS_PER_MINUTE = 60_000;

const withNote = (route: string, noteId: string): string =>
    route.replace(':noteId', noteId);

// The real AppModule on a clock the spec moves, the search engine, the pages and the AI replaced by fakes; reset() seeds the accounts and the two formed couples.
export class NotesTestApp {
    readonly clock = new DeterministicDateTimeProvider(NOW);
    readonly writer = new FakeNoteCardWriter();
    readonly search = new FakeWebSearchProvider();
    readonly pages = new FakeWebPageReader();
    private app: INestApplication | null = null;
    private client: TestClient | null = null;

    provider<T>(token: abstract new (...args: never[]) => T): T {
        return this.started().app.get(token);
    }

    get prisma(): PrismaService {
        return this.started().app.get(PrismaService);
    }

    async start(): Promise<void> {
        const app = await createTestApp({
            controllers: [],
            overrides: [
                { provide: DateTimeProvider, useValue: this.clock },
                { provide: NoteCardWriter, useValue: this.writer },
                { provide: WebSearchProvider, useValue: this.search },
                { provide: WebPageReader, useValue: this.pages },
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
        this.writer.reset();
        this.search.reset();
        this.pages.reset();
        await truncateAllTables(this.prisma);
        await Promise.all([
            ...PARTNERS.map((userId) =>
                createTestAccount(this.prisma, partnerAccount(userId)),
            ),
            ...COUPLES.map((couple) => createTestCouple(this.prisma, couple)),
        ]);
    }

    async collaborationUrl(): Promise<string> {
        const httpUrl = await this.started().app.getUrl();
        return `${httpUrl.replace('http', 'ws')}${ApiRouterEnum.NOTE_COLLABORATION}`;
    }

    advanceMinutes(minutes: number): void {
        this.clock.advanceBy(minutes * MILLISECONDS_PER_MINUTE);
    }

    unauthenticated(): TestClient {
        return this.started().client.unauthenticated();
    }

    as(userId: string): TestClient {
        return this.started().client.asPartner(userId, this.clock.now());
    }

    create(userId: string, title: string): Promise<TestResponse> {
        return this.as(userId).post(ApiRouterEnum.NOTE_CREATE, { title });
    }

    async createdNoteId(userId: string, title: string): Promise<string> {
        return noteOf(await this.create(userId, title)).noteId;
    }

    list(userId: string, query = ''): Promise<TestResponse> {
        return this.as(userId).get(`${ApiRouterEnum.NOTE_LIST}${query}`);
    }

    get(userId: string, noteId: string): Promise<TestResponse> {
        return this.as(userId).get(withNote(ApiRouterEnum.NOTE_GET, noteId));
    }

    rename(
        userId: string,
        noteId: string,
        title: string,
    ): Promise<TestResponse> {
        return this.as(userId).patch(
            withNote(ApiRouterEnum.NOTE_RENAME, noteId),
            {
                title,
            },
        );
    }

    share(userId: string, noteId: string): Promise<TestResponse> {
        return this.as(userId).post(withNote(ApiRouterEnum.NOTE_SHARE, noteId));
    }

    makePrivate(userId: string, noteId: string): Promise<TestResponse> {
        return this.as(userId).post(
            withNote(ApiRouterEnum.NOTE_MAKE_PRIVATE, noteId),
        );
    }

    delete(userId: string, noteId: string): Promise<TestResponse> {
        return this.as(userId).delete(
            withNote(ApiRouterEnum.NOTE_DELETE, noteId),
        );
    }

    private started(): { app: INestApplication; client: TestClient } {
        if (this.app === null || this.client === null) {
            throw new Error('NotesTestApp used before start()');
        }
        return { app: this.app, client: this.client };
    }
}
