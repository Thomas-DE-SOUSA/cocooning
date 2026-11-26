import type { NoteListCommand } from '../view-models/note-list-command.view-model';

// The title of the toast of a refused command, in the namespace of the Lists tab.
export const NOTE_LIST_FAILURE_KEYS: Readonly<Record<NoteListCommand, string>> =
    {
        CREATE_LIST: 'toast.createListFailed',
        EDIT_LIST: 'toast.editListFailed',
        DELETE_LIST: 'toast.deleteListFailed',
    };
