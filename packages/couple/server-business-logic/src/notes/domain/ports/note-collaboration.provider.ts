// R5, R7: the editors who lose a note are disconnected at once; a new connection checks access again.
export abstract class NoteCollaborationProvider {
    // R5: a note made private stays open for its owner only.
    abstract disconnectAllBut(noteId: string, ownerId: string): Promise<void>;
    // R7: a deleted note is closed for everyone.
    abstract disconnectEveryone(noteId: string): Promise<void>;
}
