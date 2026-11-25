import { Module } from '@nestjs/common';
import {
    CalendarEventRepository,
    CalendarLabelRepository,
    PairedCoupleProvider,
} from '@cocooning/couple-server-business-logic/agenda';
import { PairedCouplePrismaProvider } from './secondary/providers';
import {
    CalendarEventPrismaRepository,
    CalendarLabelPrismaRepository,
} from './secondary/repositories';

const adapters = [
    {
        provide: CalendarEventRepository,
        useClass: CalendarEventPrismaRepository,
    },
    {
        provide: CalendarLabelRepository,
        useClass: CalendarLabelPrismaRepository,
    },
    { provide: PairedCoupleProvider, useClass: PairedCouplePrismaProvider },
];

@Module({
    providers: adapters,
    exports: adapters.map(({ provide }) => provide),
})
export class AgendaSecondaryModule {}
