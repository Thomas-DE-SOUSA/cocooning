import { NoteChecklistReader } from '../../../domain/ports/note-checklist.reader';

type CountRequest = {
    readonly noteId: string;
    readonly content: Uint8Array;
};

// The business package cannot read Yjs: the spec chooses the count, the fake records what it was asked.
export class FakeNoteChecklistReader extends NoteChecklistReader {
    private count = 0;
    private asked: ReadonlyArray<CountRequest> = [];

    get requests(): ReadonlyArray<CountRequest> {
        return this.asked;
    }

    willCount(count: number): void {
        this.count = count;
    }

    override countOpenItems(noteId: string, content: Uint8Array): number {
        this.asked = [...this.asked, { noteId, content }];
        return this.count;
    }
}
