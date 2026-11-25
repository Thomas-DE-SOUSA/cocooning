import type { Note } from '@cocooning/couple-prisma/client';
import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import {
    NoteException,
    type NoteSnapshot,
} from '@cocooning/couple-server-business-logic/notes';
import { NoteVisibilityEnum } from '@cocooning/couple-shared-kernel/enums';
import { parseEnum } from '@cocooning/shared-kernel/utils';

// The metadata of a note: the Yjs content is read and written apart (NoteContentPrismaRepository).
export type NoteRow = Omit<Note, 'contentState'>;

export const WITHOUT_CONTENT = { contentState: true } as const;

export type NoteStateColumns = {
    readonly title: string;
    readonly visibility: string;
    readonly folderId: string | null;
    readonly updatedAt: Date;
    readonly deletedAt: Date | null;
};

export const toNoteVisibility = (raw: string) => {
    try {
        return parseEnum(raw, NoteVisibilityEnum, 'NoteVisibility');
    } catch {
        throw new NoteException({
            code: NoteExceptionCodeEnum.NOTE_DATA_CORRUPTED,
            message: 'Unknown note visibility',
        });
    }
};

export function toNoteSnapshot(raw: NoteRow): NoteSnapshot {
    return {
        id: raw.id,
        coupleId: raw.coupleId,
        ownerId: raw.ownerId,
        title: raw.title,
        visibility: toNoteVisibility(raw.visibility),
        folderId: raw.folderId,
        version: raw.version,
        metadata: {
            createdAt: raw.createdAt.toISOString(),
            updatedAt: raw.updatedAt.toISOString(),
            deletedAt:
                raw.deletedAt === null ? null : raw.deletedAt.toISOString(),
        },
    };
}

// The columns an update may change: never the id, the couple, the owner, the creation date or the version.
export function toNoteState(snapshot: NoteSnapshot): NoteStateColumns {
    const { metadata } = snapshot;
    return {
        title: snapshot.title,
        visibility: snapshot.visibility,
        folderId: snapshot.folderId,
        updatedAt: new Date(metadata.updatedAt),
        deletedAt:
            metadata.deletedAt === null ? null : new Date(metadata.deletedAt),
    };
}
