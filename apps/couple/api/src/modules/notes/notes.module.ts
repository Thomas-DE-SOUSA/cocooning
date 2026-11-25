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
    GetNoteController,
    GetNoteSpaceContentsController,
    ListNoteSpacesController,
    ListNotesController,
    MakeNotePrivateController,
    MoveFolderController,
    MoveNoteController,
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
        MoveNoteController,
        ListNoteSpacesController,
        GetNoteSpaceContentsController,
        CreateFolderController,
        RenameFolderController,
        MoveFolderController,
        DeleteFolderController,
    ],
    providers: [NoteCoupleGuard, NoteCollaborationServer],
})
export class NotesModule {}
