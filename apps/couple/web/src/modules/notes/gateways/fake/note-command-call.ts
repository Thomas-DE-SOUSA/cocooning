import type { NoteTitleForm } from '@cocooning/couple-client-business-logic/notes';
import type { NoteLocation } from '../../view-models/note-place.view-model';

export type NoteCommandCall =
    | {
          readonly operation: 'createNote';
          readonly form: NoteTitleForm;
          readonly destination: NoteLocation;
      }
    | {
          readonly operation: 'renameNote';
          readonly noteId: string;
          readonly form: NoteTitleForm;
      }
    | {
          readonly operation: 'shareNote' | 'makeNotePrivate' | 'deleteNote';
          readonly noteId: string;
      };
