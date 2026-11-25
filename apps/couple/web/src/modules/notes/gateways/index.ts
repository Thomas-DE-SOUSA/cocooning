import { notesCardAddAction } from '../actions/notes-card-add.action';
import { notesCardChooseAction } from '../actions/notes-card-choose.action';
import { notesCardCorrectAction } from '../actions/notes-card-correct.action';
import { notesCardRefineAction } from '../actions/notes-card-refine.action';
import { notesCardRefreshAction } from '../actions/notes-card-refresh.action';
import { notesFolderCreateAction } from '../actions/notes-folder-create.action';
import { notesFolderDeleteAction } from '../actions/notes-folder-delete.action';
import { notesFolderMoveAction } from '../actions/notes-folder-move.action';
import { notesFolderTemplateAction } from '../actions/notes-folder-template.action';
import { notesFolderProposeAction } from '../actions/notes-folder-propose.action';
import { notesFolderRenameAction } from '../actions/notes-folder-rename.action';
import { notesNoteCreateAction } from '../actions/notes-note-create.action';
import { notesNoteDeleteAction } from '../actions/notes-note-delete.action';
import { notesNoteMoveAction } from '../actions/notes-note-move.action';
import { notesNoteRenameAction } from '../actions/notes-note-rename.action';
import { notesSpaceContentsAction } from '../actions/notes-space-contents.action';
import type { FolderCommandGateway } from './ports/folder-command.gateway';
import type { NoteCardCommandGateway } from './ports/note-card-command.gateway';
import type { NoteCommandGateway } from './ports/note-command.gateway';
import type { NoteSheetGateways } from './ports/note-sheet.gateways';
import type { NoteSpaceContentsGateway } from './ports/note-space-contents.gateway';
import { ServerActionFolderCommandGateway } from './server-action/server-action-folder-command.gateway';
import { ServerActionNoteCardCommandGateway } from './server-action/server-action-note-card-command.gateway';
import { ServerActionNoteCommandGateway } from './server-action/server-action-note-command.gateway';
import { ServerActionNoteSpaceContentsGateway } from './server-action/server-action-note-space-contents.gateway';

export const noteCommandGateway: NoteCommandGateway =
    new ServerActionNoteCommandGateway({
        createNote: notesNoteCreateAction,
        renameNote: notesNoteRenameAction,
        deleteNote: notesNoteDeleteAction,
        moveNote: notesNoteMoveAction,
    });

export const folderCommandGateway: FolderCommandGateway =
    new ServerActionFolderCommandGateway({
        createFolder: notesFolderCreateAction,
        proposeFolderTemplate: notesFolderProposeAction,
        editFolderTemplate: notesFolderTemplateAction,
        renameFolder: notesFolderRenameAction,
        deleteFolder: notesFolderDeleteAction,
        moveFolder: notesFolderMoveAction,
    });

export const noteCardCommandGateway: NoteCardCommandGateway =
    new ServerActionNoteCardCommandGateway({
        addNoteCard: notesCardAddAction,
        chooseNoteCardCandidate: notesCardChooseAction,
        refineNoteCard: notesCardRefineAction,
        refreshNoteCard: notesCardRefreshAction,
        correctNoteCardField: notesCardCorrectAction,
    });

export const noteSpaceContentsGateway: NoteSpaceContentsGateway =
    new ServerActionNoteSpaceContentsGateway(notesSpaceContentsAction);

// The commands the sheets of the notes send.
export const noteSheetGateways: NoteSheetGateways = {
    notes: noteCommandGateway,
    folders: folderCommandGateway,
};
