import { notesNoteCreateAction } from '../actions/notes-note-create.action';
import { notesNoteDeleteAction } from '../actions/notes-note-delete.action';
import { notesNoteMakePrivateAction } from '../actions/notes-note-make-private.action';
import { notesNoteShareAction } from '../actions/notes-note-share.action';
import type { NoteCommandGateway } from './ports/note-command.gateway';
import { ServerActionNoteCommandGateway } from './server-action/server-action-note-command.gateway';

export const noteCommandGateway: NoteCommandGateway =
    new ServerActionNoteCommandGateway({
        createNote: notesNoteCreateAction,
        shareNote: notesNoteShareAction,
        makeNotePrivate: notesNoteMakePrivateAction,
        deleteNote: notesNoteDeleteAction,
    });
