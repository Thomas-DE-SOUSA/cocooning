import type { NoteTitleForm } from '@cocooning/couple-client-business-logic/notes';

export type NoteCommandCall =
    | { readonly operation: 'createNote'; readonly form: NoteTitleForm }
    | {
          readonly operation: 'shareNote' | 'makeNotePrivate' | 'deleteNote';
          readonly noteId: string;
      };
