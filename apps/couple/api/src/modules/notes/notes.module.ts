import { Module } from '@nestjs/common';
import { NotesServiceModule } from './notes-service.module';
import { NoteCoupleGuard } from './primary/couple';
import {
    CreateNoteController,
    DeleteNoteController,
    ListNotesController,
    MakeNotePrivateController,
    RenameNoteController,
    ShareNoteController,
} from './primary/controllers';

@Module({
    imports: [NotesServiceModule],
    controllers: [
        CreateNoteController,
        ListNotesController,
        RenameNoteController,
        ShareNoteController,
        MakeNotePrivateController,
        DeleteNoteController,
    ],
    providers: [NoteCoupleGuard],
})
export class NotesModule {}
