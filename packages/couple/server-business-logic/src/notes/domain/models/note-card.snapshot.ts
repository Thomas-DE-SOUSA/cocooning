import { EntityMetadata } from '@cocooning/shared-kernel/domain';
import { NoteCardId } from '../value-objects/note-card-id.vo';
import { NoteCardQuery } from '../value-objects/note-card-query.vo';
import { NoteId } from '../value-objects/note-id.vo';
import type {
    NoteCardProps,
    NoteCardSnapshot,
} from './note-card.aggregate.type';

// fromSnapshot never validates (domain.md rule 5); the snapshot holds primitives and ISO dates only.
export const noteCardFromSnapshot = (
    snapshot: NoteCardSnapshot,
): NoteCardProps => ({
    id: NoteCardId.from(snapshot.id),
    coupleId: snapshot.coupleId,
    noteId: NoteId.from(snapshot.noteId),
    status: snapshot.status,
    query: NoteCardQuery.from(snapshot.query),
    fields: snapshot.fields.map((field) => ({ ...field })),
    candidates: snapshot.candidates.map((candidate) => ({ ...candidate })),
    sources: [...snapshot.sources],
    searchedAt:
        snapshot.searchedAt === null ? null : new Date(snapshot.searchedAt),
    requestedBy: snapshot.requestedBy,
    version: snapshot.version,
    metadata: EntityMetadata.fromSnapshot(snapshot.metadata),
});

export const noteCardSnapshotOf = (props: NoteCardProps): NoteCardSnapshot => ({
    id: props.id.getValue(),
    coupleId: props.coupleId,
    noteId: props.noteId.getValue(),
    status: props.status,
    query: props.query.value,
    fields: props.fields.map((field) => ({ ...field })),
    candidates: props.candidates.map((candidate) => ({ ...candidate })),
    sources: [...props.sources],
    searchedAt:
        props.searchedAt === null ? null : props.searchedAt.toISOString(),
    requestedBy: props.requestedBy,
    version: props.version,
    metadata: props.metadata.toSnapshot(),
});
