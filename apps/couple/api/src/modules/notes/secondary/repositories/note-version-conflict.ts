import { violatedUniqueConstraint } from '@cocooning/couple-prisma/errors';
import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { NoteException } from '@cocooning/couple-server-business-logic/notes';

// Two saves read the same version: the second outbox row collides on (aggregate_id, version).
const EVENT_VERSION_CONSTRAINT = 'note_event_aggregate_id_version_key';

export function toNoteVersionConflict(error: unknown): NoteException | null {
    if (violatedUniqueConstraint(error) !== EVENT_VERSION_CONSTRAINT)
        return null;
    return new NoteException({
        code: NoteExceptionCodeEnum.NOTE_VERSION_CONFLICT,
        message: 'Note changed since it was read',
    });
}
