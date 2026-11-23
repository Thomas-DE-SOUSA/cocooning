import { Module } from '@nestjs/common';
import {
    NoteRepository,
    PairedCoupleProvider,
} from '@cocooning/couple-server-business-logic/notes';
import { PairedCouplePrismaProvider } from './secondary/providers';
import { NotePrismaRepository } from './secondary/repositories';

const adapters = [
    { provide: NoteRepository, useClass: NotePrismaRepository },
    { provide: PairedCoupleProvider, useClass: PairedCouplePrismaProvider },
];

@Module({
    providers: adapters,
    exports: adapters.map(({ provide }) => provide),
})
export class NotesSecondaryModule {}
