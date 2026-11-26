import { Injectable } from '@nestjs/common';
import { PrismaService } from '@cocooning/couple-prisma/nest';
import {
    type Folder,
    Note,
    NoteException,
    NoteRepository,
    type NoteSpaceCounts,
    visibilityOfSpace,
} from '@cocooning/couple-server-business-logic/notes';
import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import type {
    NoteListKind,
    NoteSpace,
} from '@cocooning/couple-shared-kernel/enums';
import type {
    OffsetPage,
    OffsetPaginationParams,
} from '@cocooning/shared-kernel/domain';
import { Logger, UnitOfWork } from '@cocooning/shared-kernel/ports';
import { type NoteRow, toNoteSnapshot, WITHOUT_CONTENT } from '../mappers';
import { appendNoteEvents } from './note-event-prisma.writer';
import { writeNote } from './note-prisma.writer';
import {
    countNotesByFolder,
    countNotesBySpace,
    notesVisibleTo,
    ordinaryNotesVisibleTo,
} from './note-prisma.query';
import { toVersionConflict } from './outbox-version-conflict';

const toNote = (row: NoteRow): Note => Note.fromSnapshot(toNoteSnapshot(row));

const MOST_RECENT_FIRST = [
    { updatedAt: 'desc' },
    { id: 'asc' },
] as const satisfies ReadonlyArray<Record<string, 'asc' | 'desc'>>;

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
            const conflict = toVersionConflict(
                error,
                NoteExceptionCodeEnum.NOTE_VERSION_CONFLICT,
            );
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
                where: { ...notesVisibleTo(coupleId, userId), id: noteId },
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
        const where = ordinaryNotesVisibleTo(coupleId, userId);
        return this.load({ coupleId }, async (notes) => {
            const [rows, total] = await Promise.all([
                notes.findMany({
                    where,
                    omit: WITHOUT_CONTENT,
                    orderBy: [...MOST_RECENT_FIRST],
                    skip: (page - 1) * pageSize,
                    take: pageSize,
                }),
                notes.count({ where }),
            ]);
            return { items: rows.map(toNote), total, page, pageSize };
        });
    }

    override findVisibleIn(
        coupleId: string,
        userId: string,
        space: NoteSpace,
        folderId: string | null,
    ): Promise<ReadonlyArray<Note>> {
        return this.load({ coupleId }, async (notes) => {
            const rows = await notes.findMany({
                where: {
                    ...ordinaryNotesVisibleTo(coupleId, userId),
                    visibility: visibilityOfSpace(space),
                    folderId,
                },
                omit: WITHOUT_CONTENT,
                orderBy: [...MOST_RECENT_FIRST],
            });
            return rows.map(toNote);
        });
    }

    override countVisibleByFolder(
        coupleId: string,
        userId: string,
        folders: ReadonlyArray<Folder>,
    ): Promise<ReadonlyMap<string, number>> {
        const folderIds = folders.map((folder) => folder.id.getValue());
        return this.load({ coupleId }, () =>
            countNotesByFolder(
                this.prismaService.current,
                coupleId,
                userId,
                folderIds,
            ),
        );
    }

    override countVisibleBySpace(
        coupleId: string,
        userId: string,
    ): Promise<NoteSpaceCounts> {
        return this.load({ coupleId }, () =>
            countNotesBySpace(this.prismaService.current, coupleId, userId),
        );
    }

    override findVisibleLists(
        coupleId: string,
        userId: string,
        kind: NoteListKind,
    ): Promise<ReadonlyArray<Note>> {
        return this.load({ coupleId }, async (notes) => {
            const rows = await notes.findMany({
                where: { ...notesVisibleTo(coupleId, userId), listKind: kind },
                omit: WITHOUT_CONTENT,
                orderBy: [...MOST_RECENT_FIRST],
            });
            return rows.map(toNote);
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
