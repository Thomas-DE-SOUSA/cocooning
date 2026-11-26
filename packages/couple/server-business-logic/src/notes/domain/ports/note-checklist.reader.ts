// R28: reads the content of a note, a Yjs state the business code cannot open, and counts its task items not yet
// checked, at any depth. A content it cannot read counts 0, logged by the note id only: a save never fails on it.
export abstract class NoteChecklistReader {
    abstract countOpenItems(noteId: string, content: Uint8Array): number;
}
