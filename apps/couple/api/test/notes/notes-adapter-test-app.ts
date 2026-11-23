import type { INestApplication } from '@nestjs/common';
import {
    createTestNotes,
    truncateAllTables,
} from '@cocooning/couple-e2e-shared/fixtures';
import { PrismaService } from '@cocooning/couple-prisma/nest';
import {
    type Note,
    NoteRepository,
} from '@cocooning/couple-server-business-logic/notes';
import { closeTestApp, createTestApp } from '../shared/app/create-test-app';
import { SEEDED_NOTES } from './note-repository-test-data';

// The real AppModule, read through the adapter alone (e2e.md rule 14), on the rows of note-repository-test-data.
export class NotesAdapterTestApp {
    private app: INestApplication | null = null;

    get prisma(): PrismaService {
        return this.started().get(PrismaService);
    }

    get repository(): NoteRepository {
        return this.started().get(NoteRepository);
    }

    async start(): Promise<void> {
        this.app = await createTestApp({ controllers: [], overrides: [] });
    }

    async stop(): Promise<void> {
        await closeTestApp(this.started());
    }

    async reset(): Promise<void> {
        await truncateAllTables(this.prisma);
        await createTestNotes(this.prisma, SEEDED_NOTES);
    }

    async titlesSeenBy(coupleId: string, userId: string): Promise<string[]> {
        const notes = await this.repository.findVisible(coupleId, userId);
        return notes.map((note) => note.title.value);
    }

    // A note the spec knows is visible: its absence fails the spec instead of a cast.
    async visibleNote(
        coupleId: string,
        userId: string,
        noteId: string,
    ): Promise<Note> {
        const note = await this.repository.findVisibleById(
            coupleId,
            userId,
            noteId,
        );
        if (note === null) throw new Error(`Note ${noteId} not visible`);
        return note;
    }

    private started(): INestApplication {
        if (this.app === null) {
            throw new Error('NotesAdapterTestApp used before start()');
        }
        return this.app;
    }
}
