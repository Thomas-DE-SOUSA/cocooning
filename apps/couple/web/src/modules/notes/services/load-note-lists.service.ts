import 'server-only';
import type { NoteListKind } from '@cocooning/couple-shared-kernel/enums';
import type { NoteListsReading } from '../view-models/note-lists-screen.view-model';
import { notesModule } from './notes-module.factory';

// Read by the Lists tab with the session cookie of the request (decision 0036); Envies reads nothing yet (null kind).
export function loadNoteLists(
    kind: NoteListKind | null,
): Promise<NoteListsReading> {
    if (kind === null) return Promise.resolve(null);
    return notesModule().listNoteLists.execute(kind);
}
