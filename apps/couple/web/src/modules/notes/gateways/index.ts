import { notesFolderCreateAction } from '../actions/notes-folder-create.action';
import { notesNoteCreateAction } from '../actions/notes-note-create.action';
import { notesNoteDeleteAction } from '../actions/notes-note-delete.action';
import { notesNoteMakePrivateAction } from '../actions/notes-note-make-private.action';
import { notesNoteRenameAction } from '../actions/notes-note-rename.action';
import { notesNoteShareAction } from '../actions/notes-note-share.action';
import type { FolderCommandGateway } from './ports/folder-command.gateway';
import type { NoteCommandGateway } from './ports/note-command.gateway';
import { ServerActionFolderCommandGateway } from './server-action/server-action-folder-command.gateway';
import { ServerActionNoteCommandGateway } from './server-action/server-action-note-command.gateway';

export const noteCommandGateway: NoteCommandGateway =
    new ServerActionNoteCommandGateway({
        createNote: notesNoteCreateAction,
        renameNote: notesNoteRenameAction,
        shareNote: notesNoteShareAction,
        makeNotePrivate: notesNoteMakePrivateAction,
        deleteNote: notesNoteDeleteAction,
    });

export const folderCommandGateway: FolderCommandGateway =
    new ServerActionFolderCommandGateway({
        createFolder: notesFolderCreateAction,
    });

// The commands the sheets of the notes send.
export const noteSheetGateways = {
    notes: noteCommandGateway,
    folders: folderCommandGateway,
} as const;
