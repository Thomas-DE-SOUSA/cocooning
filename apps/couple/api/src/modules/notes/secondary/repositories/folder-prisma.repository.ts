import { Injectable } from '@nestjs/common';
import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { PrismaService } from '@cocooning/couple-prisma/nest';
import {
    Folder,
    FolderRepository,
    type FolderPathItem,
    NoteException,
    type NoteSpaceCounts,
} from '@cocooning/couple-server-business-logic/notes';
import type { NoteSpace } from '@cocooning/couple-shared-kernel/enums';
import { Logger, UnitOfWork } from '@cocooning/shared-kernel/ports';
import { type FolderRow, toFolderSnapshot } from '../mappers';
import {
    countChildFolders,
    countFoldersBySpace,
    foldersVisibleTo,
    readFolderPath,
} from './folder-prisma.query';
import { moveFolderContentUp, writeFolder } from './folder-prisma.writer';
import { appendNoteEvents } from './note-event-prisma.writer';
import { toVersionConflict } from './outbox-version-conflict';

const toFolder = (row: FolderRow): Folder =>
    Folder.fromSnapshot(toFolderSnapshot(row));

const idsOf = (folders: ReadonlyArray<Folder>): string[] =>
    folders.map((folder) => folder.id.getValue());

// The folders write their events to the outbox of the context, note_event (decision 0021).
@Injectable()
export class FolderPrismaRepository extends FolderRepository {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly unitOfWork: UnitOfWork,
        private readonly logger: Logger,
    ) {
        super();
        this.logger.setContext(FolderPrismaRepository.name);
    }

    override async save(folder: Folder): Promise<void> {
        const snapshot = folder.toSnapshot();
        const events = folder.getDomainEvents();
        try {
            await this.unitOfWork.run(async () => {
                const tx = this.prismaService.current;
                await writeFolder(tx, snapshot);
                await appendNoteEvents(tx, snapshot.id, events);
            });
        } catch (error) {
            this.rethrow(error, 'Failed to save folder', snapshot.id);
        }
    }

    override findVisibleById(
        coupleId: string,
        userId: string,
        folderId: string,
    ): Promise<Folder | null> {
        return this.read(folderId, async (tx) => {
            const row = await tx.folder.findFirst({
                where: { ...foldersVisibleTo(coupleId, userId), id: folderId },
            });
            return row === null ? null : toFolder(row);
        });
    }

    override findVisibleChildren(
        coupleId: string,
        userId: string,
        space: NoteSpace,
        parentFolderId: string | null,
    ): Promise<ReadonlyArray<Folder>> {
        return this.read(coupleId, async (tx) => {
            const rows = await tx.folder.findMany({
                where: {
                    ...foldersVisibleTo(coupleId, userId),
                    space,
                    parentFolderId,
                },
                orderBy: [{ name: 'asc' }, { id: 'asc' }],
            });
            return rows.map(toFolder);
        });
    }

    override findPath(
        coupleId: string,
        folderId: string | null,
    ): Promise<ReadonlyArray<FolderPathItem>> {
        if (folderId === null) return Promise.resolve([]);
        return this.read(folderId, (tx) =>
            readFolderPath(tx, coupleId, folderId),
        );
    }

    override countVisibleChildren(
        coupleId: string,
        userId: string,
        folders: ReadonlyArray<Folder>,
    ): Promise<ReadonlyMap<string, number>> {
        return this.read(coupleId, (tx) =>
            countChildFolders(tx, coupleId, userId, idsOf(folders)),
        );
    }

    override countVisibleBySpace(
        coupleId: string,
        userId: string,
    ): Promise<NoteSpaceCounts> {
        return this.read(coupleId, (tx) =>
            countFoldersBySpace(tx, coupleId, userId),
        );
    }

    override async moveContentUp(folder: Folder): Promise<void> {
        const { coupleId, id, parentFolderId } = folder.toSnapshot();
        try {
            await moveFolderContentUp(
                this.prismaService.current,
                coupleId,
                id,
                parentFolderId,
            );
        } catch (error) {
            this.rethrow(error, 'Failed to move folder content up', id);
        }
    }

    // Logged by identifiers only: names belong to the couple (core.md rule 33).
    private async read<T>(
        logId: string,
        work: (tx: PrismaService['current']) => Promise<T>,
    ): Promise<T> {
        try {
            return await work(this.prismaService.current);
        } catch (error) {
            if (error instanceof NoteException) throw error;
            this.logger.error('Failed to load folders', {
                aggregateId: logId,
                error,
            });
            throw error;
        }
    }

    private rethrow(error: unknown, message: string, folderId: string): never {
        if (error instanceof NoteException) throw error;
        const conflict = toVersionConflict(
            error,
            NoteExceptionCodeEnum.FOLDER_VERSION_CONFLICT,
        );
        if (conflict !== null) throw conflict;
        this.logger.error(message, { folderId, error });
        throw error;
    }
}
