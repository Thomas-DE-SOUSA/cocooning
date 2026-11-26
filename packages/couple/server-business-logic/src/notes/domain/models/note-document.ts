// The Yjs state of a note as the real-time channel stores it, with its unchecked task items (R28): the count of a
// list's home, kept for every note and shown for lists only.
export type NoteDocument = {
    readonly content: Uint8Array;
    readonly openItemCount: number;
};
