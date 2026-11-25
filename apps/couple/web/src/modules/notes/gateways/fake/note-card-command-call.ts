import type { NoteCardNameForm } from '@cocooning/couple-client-business-logic/notes';

export type NoteCardCommandCall = {
    readonly operation: 'addNoteCard';
    readonly folderId: string;
    readonly form: NoteCardNameForm;
};
