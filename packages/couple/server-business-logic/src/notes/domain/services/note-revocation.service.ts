import { NoteVisibilityEnum } from '@cocooning/couple-shared-kernel/enums';
import type { Note } from '../models/note.aggregate';
import type { NoteCollaborationProvider } from '../ports/note-collaboration.provider';

export class NoteRevocationService {
    constructor(
        private readonly noteCollaborationProvider: NoteCollaborationProvider,
    ) {}

    // R5, R11: a note moved into « Privé » stays open for its owner only; a shared note keeps its editors.
    async disconnectThoseWhoLostIt(note: Note): Promise<void> {
        if (note.visibility !== NoteVisibilityEnum.PRIVATE) return;
        await this.noteCollaborationProvider.disconnectAllBut(
            note.id.getValue(),
            note.ownerId,
        );
    }
}
