import { Module } from '@nestjs/common';
import {
    NoteCollaborationProvider,
    NoteContentRepository,
    NoteRepository,
    PairedCoupleProvider,
} from '@cocooning/couple-server-business-logic/notes';
import {
    HocuspocusNoteCollaborationProvider,
    NoteHocuspocus,
} from './secondary/collaboration';
import { PairedCouplePrismaProvider } from './secondary/providers';
import {
    NoteContentPrismaRepository,
    NotePrismaRepository,
} from './secondary/repositories';

const adapters = [
    { provide: NoteRepository, useClass: NotePrismaRepository },
    { provide: NoteContentRepository, useClass: NoteContentPrismaRepository },
    { provide: PairedCoupleProvider, useClass: PairedCouplePrismaProvider },
    {
        provide: NoteCollaborationProvider,
        useClass: HocuspocusNoteCollaborationProvider,
    },
];

@Module({
    providers: [NoteHocuspocus, ...adapters],
    exports: [NoteHocuspocus, ...adapters.map(({ provide }) => provide)],
})
export class NotesSecondaryModule {}
