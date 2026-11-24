import { Module } from '@nestjs/common';
import { AuthenticationServiceModule } from '../authentication';
import { NotesServiceModule } from './notes-service.module';
import { NoteCollaborationServer } from './primary/collaboration';
import { NoteCoupleGuard } from './primary/couple';
import {
    CreateNoteController,
    DeleteNoteController,
    GetNoteController,
    ListNotesController,
    MakeNotePrivateController,
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
    ],
    providers: [NoteCoupleGuard, NoteCollaborationServer],
})
export class NotesModule {}
