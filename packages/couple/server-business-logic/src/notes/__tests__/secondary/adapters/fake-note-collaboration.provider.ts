import { NoteCollaborationProvider } from '../../../domain/ports/note-collaboration.provider';

export type Disconnection = {
    readonly noteId: string;
    readonly keptUserId: string | null;
};

// Records the editors disconnected, and whom each disconnection kept.
export class FakeNoteCollaborationProvider extends NoteCollaborationProvider {
    private recorded: ReadonlyArray<Disconnection> = [];

    get disconnections(): ReadonlyArray<Disconnection> {
        return this.recorded;
    }

    override disconnectAllBut(noteId: string, ownerId: string): Promise<void> {
        this.recorded = [...this.recorded, { noteId, keptUserId: ownerId }];
        return Promise.resolve();
    }

    override disconnectEveryone(noteId: string): Promise<void> {
        this.recorded = [...this.recorded, { noteId, keptUserId: null }];
        return Promise.resolve();
    }
}
