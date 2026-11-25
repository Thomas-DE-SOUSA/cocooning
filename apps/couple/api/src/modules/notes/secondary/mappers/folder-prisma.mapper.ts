import { type Folder, Prisma } from '@cocooning/couple-prisma/client';
import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import {
    type FolderSnapshot,
    NoteException,
} from '@cocooning/couple-server-business-logic/notes';
import {
    FolderKindEnum,
    NoteSpaceEnum,
} from '@cocooning/couple-shared-kernel/enums';
import { parseEnum } from '@cocooning/shared-kernel/utils';

export type FolderRow = Folder;

export type FolderStateColumns = {
    readonly parentFolderId: string | null;
    readonly name: string;
    readonly subject: string | null;
    readonly cardTemplate: Prisma.InputJsonValue | typeof Prisma.JsonNull;
    readonly updatedAt: Date;
    readonly deletedAt: Date | null;
};

const corrupted = (message: string): NoteException =>
    new NoteException({
        code: NoteExceptionCodeEnum.FOLDER_DATA_CORRUPTED,
        message,
    });

export const toFolderSpace = (raw: string) => {
    try {
        return parseEnum(raw, NoteSpaceEnum, 'NoteSpace');
    } catch {
        throw corrupted('Unknown folder space');
    }
};

const toFolderKind = (raw: string) => {
    try {
        return parseEnum(raw, FolderKindEnum, 'FolderKind');
    } catch {
        throw corrupted('Unknown folder kind');
    }
};

// R17: a JSON array of field names, or null outside the top of a smart tree.
const toCardTemplate = (
    raw: Prisma.JsonValue,
): ReadonlyArray<string> | null => {
    if (raw === null) return null;
    if (Array.isArray(raw) && raw.every((name) => typeof name === 'string'))
        return raw;
    throw corrupted('Card template is not a list of names');
};

export function toFolderSnapshot(raw: FolderRow): FolderSnapshot {
    return {
        id: raw.id,
        coupleId: raw.coupleId,
        ownerId: raw.ownerId,
        space: toFolderSpace(raw.space),
        kind: toFolderKind(raw.kind),
        parentFolderId: raw.parentFolderId,
        name: raw.name,
        subject: raw.subject,
        cardTemplate: toCardTemplate(raw.cardTemplate),
        version: raw.version,
        metadata: {
            createdAt: raw.createdAt.toISOString(),
            updatedAt: raw.updatedAt.toISOString(),
            deletedAt:
                raw.deletedAt === null ? null : raw.deletedAt.toISOString(),
        },
    };
}

// The columns an update may change: never the id, the couple, the owner, the space (R15), the kind (R17),
// the creation date or the version.
export function toFolderState(snapshot: FolderSnapshot): FolderStateColumns {
    const { metadata, cardTemplate } = snapshot;
    return {
        parentFolderId: snapshot.parentFolderId,
        name: snapshot.name,
        subject: snapshot.subject,
        cardTemplate:
            cardTemplate === null ? Prisma.JsonNull : [...cardTemplate],
        updatedAt: new Date(metadata.updatedAt),
        deletedAt:
            metadata.deletedAt === null ? null : new Date(metadata.deletedAt),
    };
}
