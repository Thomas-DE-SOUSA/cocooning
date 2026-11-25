import { notesFolderCreateAction } from '../actions/notes-folder-create.action';
import { notesFolderDeleteAction } from '../actions/notes-folder-delete.action';
import { notesFolderMoveAction } from '../actions/notes-folder-move.action';
import { notesFolderRenameAction } from '../actions/notes-folder-rename.action';
import { notesNoteCreateAction } from '../actions/notes-note-create.action';
import { notesNoteDeleteAction } from '../actions/notes-note-delete.action';
import { notesNoteMakePrivateAction } from '../actions/notes-note-make-private.action';
import { notesNoteMoveAction } from '../actions/notes-note-move.action';
import { notesNoteRenameAction } from '../actions/notes-note-rename.action';
import { notesNoteShareAction } from '../actions/notes-note-share.action';
import { notesSpaceContentsAction } from '../actions/notes-space-contents.action';
import type { FolderCommandGateway } from './ports/folder-command.gateway';
import type { NoteCommandGateway } from './ports/note-command.gateway';
import type { NoteSheetGateways } from './ports/note-sheet.gateways';
import type { NoteSpaceContentsGateway } from './ports/note-space-contents.gateway';
import { ServerActionFolderCommandGateway } from './server-action/server-action-folder-command.gateway';
import { ServerActionNoteCommandGateway } from './server-action/server-action-note-command.gateway';
import { ServerActionNoteSpaceContentsGateway } from './server-action/server-action-note-space-contents.gateway';

export const noteCommandGateway: NoteCommandGateway =
    new ServerActionNoteCommandGateway({
        createNote: notesNoteCreateAction,
        renameNote: notesNoteRenameAction,
        shareNote: notesNoteShareAction,
        makeNotePrivate: notesNoteMakePrivateAction,
        deleteNote: notesNoteDeleteAction,
        moveNote: notesNoteMoveAction,
    });

export const folderCommandGateway: FolderCommandGateway =
    new ServerActionFolderCommandGateway({
        createFolder: notesFolderCreateAction,
        renameFolder: notesFolderRenameAction,
        deleteFolder: notesFolderDeleteAction,
        moveFolder: notesFolderMoveAction,
    });

export const noteSpaceContentsGateway: NoteSpaceContentsGateway =
    new ServerActionNoteSpaceContentsGateway(notesSpaceContentsAction);

// The commands the sheets of the notes send.
export const noteSheetGateways: NoteSheetGateways = {
    notes: noteCommandGateway,
    folders: folderCommandGateway,
};
