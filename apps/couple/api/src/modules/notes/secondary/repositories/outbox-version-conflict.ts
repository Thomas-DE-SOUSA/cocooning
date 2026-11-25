import { violatedUniqueConstraint } from '@cocooning/couple-prisma/errors';
import type { NoteExceptionCode } from '@cocooning/couple-contract/notes';
import { NoteException } from '@cocooning/couple-server-business-logic/notes';

// Two saves read the same version: the second outbox row collides on (aggregate_id, version).
// A stale save of a row deleted in between finds it absent and collides on its primary key (prisma CLAUDE.md, Pieges).
const CONFLICT_CONSTRAINTS: ReadonlySet<string> = new Set([
    'note_event_aggregate_id_version_key',
    'folder_pkey',
    'note_card_pkey',
    'note_card_couple_id_note_id_key',
]);

export function toVersionConflict(
    error: unknown,
    code: NoteExceptionCode,
): NoteException | null {
    const constraint = violatedUniqueConstraint(error);
    if (constraint === null || !CONFLICT_CONSTRAINTS.has(constraint))
        return null;
    return new NoteException({
        code,
        message: 'Changed since it was read',
    });
}
