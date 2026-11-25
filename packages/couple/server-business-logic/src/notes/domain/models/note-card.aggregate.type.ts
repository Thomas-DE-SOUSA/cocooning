import type { NoteCardStatus } from '@cocooning/couple-shared-kernel/enums';
import type {
    EntityMetadata,
    EntityMetadataSnapshot,
} from '@cocooning/shared-kernel/domain';
import type { CardTemplate } from '../value-objects/card-template.vo';
import type { NoteCardId } from '../value-objects/note-card-id.vo';
import type { NoteCardQuery } from '../value-objects/note-card-query.vo';
import type { NoteId } from '../value-objects/note-id.vo';

// One field of a card: a null value is « non trouvé » (R21), isManual a value corrected by hand (R22).
export type CardField = {
    readonly name: string;
    readonly value: string | null;
    readonly isManual: boolean;
};

// R19: one of the items the typed name may designate.
export type CardCandidate = {
    readonly label: string;
    readonly detail: string;
};

export type NoteCardProps = {
    readonly id: NoteCardId;
    readonly coupleId: string;
    readonly noteId: NoteId;
    status: NoteCardStatus;
    query: NoteCardQuery;
    fields: ReadonlyArray<CardField>;
    candidates: ReadonlyArray<CardCandidate>;
    sources: ReadonlyArray<string>;
    searchedAt: Date | null;
    // The partner who asked for the last search: the background task acts in their name.
    requestedBy: string;
    readonly version: number;
    metadata: EntityMetadata;
};

export type CreateNoteCardInput = {
    readonly coupleId: string;
    readonly noteId: NoteId;
    readonly requestedBy: string;
    readonly query: NoteCardQuery;
    readonly template: CardTemplate;
};

export type NoteCardSnapshot = {
    readonly id: string;
    readonly coupleId: string;
    readonly noteId: string;
    readonly status: NoteCardStatus;
    readonly query: string;
    readonly fields: ReadonlyArray<CardField>;
    readonly candidates: ReadonlyArray<CardCandidate>;
    readonly sources: ReadonlyArray<string>;
    readonly searchedAt: string | null;
    readonly requestedBy: string;
    readonly version: number;
    readonly metadata: EntityMetadataSnapshot;
};
