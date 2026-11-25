import type { NoteCard, Prisma } from '@cocooning/couple-prisma/client';
import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import {
    NoteException,
    type NoteCardSnapshot,
} from '@cocooning/couple-server-business-logic/notes';
import { NoteCardStatusEnum } from '@cocooning/couple-shared-kernel/enums';
import { parseEnum } from '@cocooning/shared-kernel/utils';
import { z } from 'zod';

export type NoteCardRow = NoteCard;

const FieldsSchema = z.array(
    z.object({
        name: z.string(),
        value: z.string().nullable(),
        isManual: z.boolean(),
    }),
);
const CandidatesSchema = z.array(
    z.object({ label: z.string(), detail: z.string() }),
);
const SourcesSchema = z.array(z.string());

const corrupted = (message: string): NoteException =>
    new NoteException({
        code: NoteExceptionCodeEnum.NOTE_CARD_DATA_CORRUPTED,
        message,
    });

const parseColumn = <T>(
    schema: z.ZodType<T>,
    raw: Prisma.JsonValue,
    column: string,
): T => {
    const parsed = schema.safeParse(raw);
    if (parsed.success) return parsed.data;
    throw corrupted(`Unreadable ${column}`);
};

const toStatus = (raw: string) => {
    try {
        return parseEnum(raw, NoteCardStatusEnum, 'NoteCardStatus');
    } catch {
        throw corrupted('Unknown note card status');
    }
};

export function toNoteCardSnapshot(raw: NoteCardRow): NoteCardSnapshot {
    return {
        id: raw.id,
        coupleId: raw.coupleId,
        noteId: raw.noteId,
        status: toStatus(raw.status),
        query: raw.query,
        fields: parseColumn(FieldsSchema, raw.fields, 'fields'),
        candidates: parseColumn(CandidatesSchema, raw.candidates, 'candidates'),
        sources: parseColumn(SourcesSchema, raw.sources, 'sources'),
        searchedAt:
            raw.searchedAt === null ? null : raw.searchedAt.toISOString(),
        requestedBy: raw.requestedBy,
        version: raw.version,
        metadata: {
            createdAt: raw.createdAt.toISOString(),
            updatedAt: raw.updatedAt.toISOString(),
            deletedAt: null,
        },
    };
}

// The columns an update may change: never the id, the couple, the note, the creation date or the version.
export function toNoteCardState(snapshot: NoteCardSnapshot) {
    return {
        status: snapshot.status,
        query: snapshot.query,
        fields: snapshot.fields.map((field) => ({ ...field })),
        candidates: snapshot.candidates.map((candidate) => ({ ...candidate })),
        sources: [...snapshot.sources],
        searchedAt:
            snapshot.searchedAt === null ? null : new Date(snapshot.searchedAt),
        requestedBy: snapshot.requestedBy,
        updatedAt: new Date(snapshot.metadata.updatedAt),
    };
}
