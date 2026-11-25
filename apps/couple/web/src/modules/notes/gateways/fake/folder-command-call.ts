import type { FolderNameForm } from '@cocooning/couple-client-business-logic/notes';
import type { NoteLocation } from '../../view-models/note-place.view-model';

export type FolderCommandCall = {
    readonly operation: 'createFolder';
    readonly form: FolderNameForm;
    readonly destination: NoteLocation;
};
