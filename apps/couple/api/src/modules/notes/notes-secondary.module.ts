import { Module } from '@nestjs/common';
import {
    FolderRepository,
    NoteCardRepository,
    NoteCardSearchCounter,
    NoteChecklistReader,
    NoteCollaborationProvider,
    NoteContentRepository,
    NoteRepository,
    PairedCoupleProvider,
} from '@cocooning/couple-server-business-logic/notes';
import {
    HocuspocusNoteCollaborationProvider,
    NoteHocuspocus,
    YjsNoteChecklistReader,
} from './secondary/collaboration';
import {
    fetchWebPageReaderProvider,
    geminiNoteCardWriterProvider,
    nominatimPlaceDirectoryProvider,
    PairedCouplePrismaProvider,
    searxngWebSearchProvider,
} from './secondary/providers';
import {
    FolderPrismaRepository,
    NoteCardPrismaRepository,
    NoteCardSearchPrismaCounter,
    NoteContentPrismaRepository,
    NotePrismaRepository,
} from './secondary/repositories';

const technicalAdapters = [
    geminiNoteCardWriterProvider,
    searxngWebSearchProvider,
    fetchWebPageReaderProvider,
    nominatimPlaceDirectoryProvider,
];

const adapters = [
    { provide: NoteRepository, useClass: NotePrismaRepository },
    { provide: FolderRepository, useClass: FolderPrismaRepository },
    { provide: NoteCardRepository, useClass: NoteCardPrismaRepository },
    { provide: NoteCardSearchCounter, useClass: NoteCardSearchPrismaCounter },
    { provide: NoteContentRepository, useClass: NoteContentPrismaRepository },
    { provide: NoteChecklistReader, useClass: YjsNoteChecklistReader },
    { provide: PairedCoupleProvider, useClass: PairedCouplePrismaProvider },
    {
        provide: NoteCollaborationProvider,
        useClass: HocuspocusNoteCollaborationProvider,
    },
];

@Module({
    providers: [NoteHocuspocus, ...adapters, ...technicalAdapters],
    exports: [
        NoteHocuspocus,
        ...adapters.map(({ provide }) => provide),
        ...technicalAdapters.map(({ provide }) => provide),
    ],
})
export class NotesSecondaryModule {}
