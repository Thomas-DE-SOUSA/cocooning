import { Module } from '@nestjs/common';
import {
    FolderRepository,
    NoteCardRepository,
    NoteCollaborationProvider,
    NoteContentRepository,
    NoteRepository,
    PairedCoupleProvider,
} from '@cocooning/couple-server-business-logic/notes';
import {
    HocuspocusNoteCollaborationProvider,
    NoteHocuspocus,
} from './secondary/collaboration';
import {
    geminiNoteCardWriterProvider,
    PairedCouplePrismaProvider,
} from './secondary/providers';
import {
    FolderPrismaRepository,
    NoteCardPrismaRepository,
    NoteContentPrismaRepository,
    NotePrismaRepository,
} from './secondary/repositories';

const adapters = [
    { provide: NoteRepository, useClass: NotePrismaRepository },
    { provide: FolderRepository, useClass: FolderPrismaRepository },
    { provide: NoteCardRepository, useClass: NoteCardPrismaRepository },
    { provide: NoteContentRepository, useClass: NoteContentPrismaRepository },
    { provide: PairedCoupleProvider, useClass: PairedCouplePrismaProvider },
    {
        provide: NoteCollaborationProvider,
        useClass: HocuspocusNoteCollaborationProvider,
    },
];

@Module({
    providers: [NoteHocuspocus, ...adapters, geminiNoteCardWriterProvider],
    exports: [
        NoteHocuspocus,
        ...adapters.map(({ provide }) => provide),
        geminiNoteCardWriterProvider.provide,
    ],
})
export class NotesSecondaryModule {}
