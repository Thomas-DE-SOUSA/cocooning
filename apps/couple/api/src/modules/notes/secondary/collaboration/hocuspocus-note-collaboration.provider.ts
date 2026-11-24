import { Injectable } from '@nestjs/common';
import { NoteCollaborationProvider } from '@cocooning/couple-server-business-logic/notes';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { NoteHocuspocus } from './note-hocuspocus';

// A document is named by its note id. A closed connection stays closed for that document: the PWA reopens the note,
// and the access check of the new connection refuses whoever lost it.
@Injectable()
export class HocuspocusNoteCollaborationProvider extends NoteCollaborationProvider {
    constructor(private readonly noteHocuspocus: NoteHocuspocus) {
        super();
    }

    override disconnectAllBut(noteId: string, ownerId: string): Promise<void> {
        const document = this.noteHocuspocus.instance.documents.get(noteId);
        document?.connections.forEach((_clients, connection) => {
            // The context set by onAuthenticate (note-collaboration.hooks.ts); Hocuspocus types a document's connections loosely.
            const { userId } = connection.context as ExecutionContext;
            if (userId !== ownerId) {
                connection.close();
            }
        });
        return Promise.resolve();
    }

    override disconnectEveryone(noteId: string): Promise<void> {
        this.noteHocuspocus.instance.closeConnections(noteId);
        return Promise.resolve();
    }
}
