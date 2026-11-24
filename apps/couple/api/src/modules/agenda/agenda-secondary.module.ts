import { Module } from '@nestjs/common';
import {
    CalendarEventRepository,
    PairedCoupleProvider,
} from '@cocooning/couple-server-business-logic/agenda';
import { PairedCouplePrismaProvider } from './secondary/providers';
import { CalendarEventPrismaRepository } from './secondary/repositories';

const adapters = [
    {
        provide: CalendarEventRepository,
        useClass: CalendarEventPrismaRepository,
    },
    { provide: PairedCoupleProvider, useClass: PairedCouplePrismaProvider },
];

@Module({
    providers: adapters,
    exports: adapters.map(({ provide }) => provide),
})
export class AgendaSecondaryModule {}
