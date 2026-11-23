import { Injectable } from '@nestjs/common';
import type { Prisma } from '@cocooning/couple-prisma/client';
import { PrismaService } from '@cocooning/couple-prisma/nest';
import {
    Note,
    NoteException,
    NoteRepository,
} from '@cocooning/couple-server-business-logic/notes';
import { NoteVisibilityEnum } from '@cocooning/couple-shared-kernel/enums';
import { Logger, UnitOfWork } from '@cocooning/shared-kernel/ports';
import { toNoteSnapshot } from '../mappers';
import { appendNoteEvents } from './note-event-prisma.writer';
import { writeNote } from './note-prisma.writer';
import { toNoteVersionConflict } from './note-version-conflict';

// R4: the shared notes of the couple and the partner's own private notes, in the query (core-backend.md rule 12).
const visibleTo = (
    coupleId: string,
    userId: string,
): Prisma.NoteWhereInput => ({
    coupleId,
    OR: [{ visibility: NoteVisibilityEnum.SHARED }, { ownerId: userId }],
});

@Injectable()
export class NotePrismaRepository extends NoteRepository {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly unitOfWork: UnitOfWork,
        private readonly logger: Logger,
    ) {
        super();
        this.logger.setContext(NotePrismaRepository.name);
    }

    // State and events in one transaction, joined by an open unit of work (concurrency.md rule 2).
    override async save(note: Note): Promise<void> {
        const snapshot = note.toSnapshot();
        const events = note.getDomainEvents();
        try {
            await this.unitOfWork.run(async () => {
                const tx = this.prismaService.current;
                await writeNote(tx, snapshot);
                await appendNoteEvents(tx, snapshot.id, events);
            });
        } catch (error) {
            if (error instanceof NoteException) throw error;
            const conflict = toNoteVersionConflict(error);
            if (conflict !== null) throw conflict;
            this.logger.error('Failed to save note', {
                noteId: snapshot.id,
                error,
            });
            throw error;
        }
    }

    override async findVisibleById(
        coupleId: string,
        userId: string,
        noteId: string,
    ): Promise<Note | null> {
        const [note] = await this.findMany(
            { ...visibleTo(coupleId, userId), id: noteId },
            { noteId },
        );
        return note ?? null;
    }

    override findVisible(coupleId: string, userId: string): Promise<Note[]> {
        return this.findMany(visibleTo(coupleId, userId), { coupleId });
    }

    // Logged by identifiers only: titles belong to the couple (core.md rule 33).
    private async findMany(
        where: Prisma.NoteWhereInput,
        logContext: Record<string, string>,
    ): Promise<Note[]> {
        try {
            const rows = await this.prismaService.current.note.findMany({
                where,
                orderBy: [{ updatedAt: 'desc' }, { id: 'asc' }],
            });
            return rows.map((row) => Note.fromSnapshot(toNoteSnapshot(row)));
        } catch (error) {
            if (error instanceof NoteException) throw error;
            this.logger.error('Failed to load notes', { ...logContext, error });
            throw error;
        }
    }
}
