import { Module } from '@nestjs/common';
import { AuthenticationServiceModule } from '../authentication';
import { NotesServiceModule } from './notes-service.module';
import { NoteCollaborationServer } from './primary/collaboration';
import { NoteCoupleGuard } from './primary/couple';
import { NoteCardEnrichmentScheduler } from './primary/scheduler';
import {
    AddNoteCardController,
    ChooseNoteCardCandidateController,
    CorrectNoteCardFieldController,
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
    RefineNoteCardController,
    RefreshNoteCardController,
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
        ProposeFolderTemplateController,
        EditFolderTemplateController,
        AddNoteCardController,
        ChooseNoteCardCandidateController,
        RefineNoteCardController,
        RefreshNoteCardController,
        CorrectNoteCardFieldController,
    ],
    providers: [
        NoteCoupleGuard,
        NoteCollaborationServer,
        NoteCardEnrichmentScheduler,
    ],
})
export class NotesModule {}
