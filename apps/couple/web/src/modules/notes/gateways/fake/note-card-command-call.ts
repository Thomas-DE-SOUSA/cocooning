import type {
    NoteCardFieldForm,
    NoteCardNameForm,
    NoteCardQueryForm,
} from '@cocooning/couple-client-business-logic/notes';

export type NoteCardCommandCall =
    | {
          readonly operation: 'addNoteCard';
          readonly folderId: string;
          readonly form: NoteCardNameForm;
      }
    | {
          readonly operation: 'chooseNoteCardCandidate';
          readonly noteId: string;
          readonly candidateIndex: number;
      }
    | {
          readonly operation: 'refineNoteCard';
          readonly noteId: string;
          readonly form: NoteCardQueryForm;
      }
    | { readonly operation: 'refreshNoteCard'; readonly noteId: string }
    | {
          readonly operation: 'correctNoteCardField';
          readonly noteId: string;
          readonly fieldName: string;
          readonly form: NoteCardFieldForm;
      };
