import type { NoteCardStatus } from '@cocooning/couple-shared-kernel/enums';
import type { NoteCard } from '../../domain/models/note-card.aggregate';
import type {
    CardCandidate,
    CardField,
} from '../../domain/models/note-card.aggregate.type';

export type NoteCardView = {
    readonly noteCardId: string;
    readonly noteId: string;
    readonly status: NoteCardStatus;
    readonly query: string;
    readonly fields: ReadonlyArray<CardField>;
    readonly candidates: ReadonlyArray<CardCandidate>;
    readonly sources: ReadonlyArray<string>;
    readonly searchedAt: Date | null;
    readonly updatedAt: Date;
};

export const toNoteCardView = (card: NoteCard): NoteCardView => ({
    noteCardId: card.id.getValue(),
    noteId: card.noteId,
    status: card.status,
    query: card.query.value,
    fields: card.fields,
    candidates: card.candidates,
    sources: card.sources,
    searchedAt: card.searchedAt,
    updatedAt: card.updatedAt,
});
