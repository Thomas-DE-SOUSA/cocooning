import { Module } from '@nestjs/common';
import { AuthenticationServiceModule } from '../authentication';
import { NotesServiceModule } from './notes-service.module';
import { NoteCollaborationServer } from './primary/collaboration';
import { NoteCoupleGuard } from './primary/couple';
import {
    CreateFolderController,
    CreateNoteController,
    DeleteFolderController,
    DeleteNoteController,
    EditFolderTemplateController,
    GetNoteController,
    GetNoteSpaceContentsController,
    ListNoteSpacesController,
    ListNotesController,
    MakeNotePrivateController,
    MoveFolderController,
    MoveNoteController,
    ProposeFolderTemplateController,
    RenameFolderController,
    RenameNoteController,
    ShareNoteController,
} from './primary/controllers';

@Module({
    imports: [NotesServiceModule, AuthenticationServiceModule],
    controllers: [
        CreateNoteController,
        ListNotesController,
        GetNoteController,
        RenameNoteController,
        ShareNoteController,
        MakeNotePrivateController,
        DeleteNoteController,
        EditFolderTemplateController,
        MoveNoteController,
        ProposeFolderTemplateController,
        ListNoteSpacesController,
        GetNoteSpaceContentsController,
        CreateFolderController,
        RenameFolderController,
        MoveFolderController,
        DeleteFolderController,
        ProposeFolderTemplateController,
        EditFolderTemplateController,
    ],
    providers: [NoteCoupleGuard, NoteCollaborationServer],
})
export class NotesModule {}
