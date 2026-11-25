import { MoveNoteRequestSchema } from '@cocooning/couple-contract/notes';

// The place a server action receives from the browser (R10, R13): a space and one of its folders, null for its root,
// the shape the contract gives the destination of a note.
export const NoteLocationSchema = MoveNoteRequestSchema;
