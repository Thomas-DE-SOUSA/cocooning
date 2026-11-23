import { Injectable } from '@nestjs/common';
import type { Prisma } from '@cocooning/couple-prisma/client';
import { PrismaService } from '@cocooning/couple-prisma/nest';
import {
    Note,
    NoteException,
    NoteRepository,
} from '@cocooning/couple-server-business-logic/notes';
import { NoteVisibilityEnum } from '@cocooning/couple-shared-kernel/enums';
import type {
    OffsetPage,
    OffsetPaginationParams,
} from '@cocooning/shared-kernel/domain';
import { Logger, UnitOfWork } from '@cocooning/shared-kernel/ports';
import { type NoteRow, toNoteSnapshot, WITHOUT_CONTENT } from '../mappers';
import { appendNoteEvents } from './note-event-prisma.writer';
import { writeNote } from './note-prisma.writer';
import { toNoteVersionConflict } from './note-version-conflict';

const toNote = (row: NoteRow): Note => Note.fromSnapshot(toNoteSnapshot(row));

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
        return this.load({ noteId }, async (notes) => {
            const row = await notes.findFirst({
                where: { ...visibleTo(coupleId, userId), id: noteId },
                omit: WITHOUT_CONTENT,
            });
            return row === null ? null : toNote(row);
        });
    }

    // One page and its total, read with the same filter (decision 0025).
    override findVisible(
        coupleId: string,
        userId: string,
        { page, pageSize }: OffsetPaginationParams,
    ): Promise<OffsetPage<Note>> {
        const where = visibleTo(coupleId, userId);
        return this.load({ coupleId }, async (notes) => {
            const [rows, total] = await Promise.all([
                notes.findMany({
                    where,
                    omit: WITHOUT_CONTENT,
                    orderBy: [{ updatedAt: 'desc' }, { id: 'asc' }],
                    skip: (page - 1) * pageSize,
                    take: pageSize,
                }),
                notes.count({ where }),
            ]);
            return { items: rows.map(toNote), total, page, pageSize };
        });
    }

    // Logged by identifiers only: titles belong to the couple (core.md rule 33).
    private async load<T>(
        logContext: Record<string, string>,
        read: (notes: PrismaService['current']['note']) => Promise<T>,
    ): Promise<T> {
        try {
            return await read(this.prismaService.current.note);
        } catch (error) {
            if (error instanceof NoteException) throw error;
            this.logger.error('Failed to load notes', { ...logContext, error });
            throw error;
        }
    }
}
