import { Module } from '@nestjs/common';
import {
    AgendaCoupleGuardService,
    CreateCalendarEventUseCase,
    CreateCalendarLabelUseCase,
    DeleteCalendarEventUseCase,
    DeleteCalendarLabelUseCase,
    EditCalendarEventUseCase,
    EditCalendarLabelUseCase,
    GetCalendarEventUseCase,
    ListCalendarEventsUseCase,
    ListCalendarLabelsUseCase,
    MakeCalendarEventPrivateUseCase,
    PairedCoupleProvider,
    ShareCalendarEventUseCase,
} from '@cocooning/couple-server-business-logic/agenda';
import { AgendaSecondaryModule } from './agenda-secondary.module';
import { agendaUseCase } from './agenda-use-case.factory';

const mutation = <T>(
    token: new (
        ...args: ConstructorParameters<typeof EditCalendarEventUseCase>
    ) => T,
) =>
    agendaUseCase(
        token,
        (d) => new token(d.repository, d.preconditions, d.clock, d.publishing),
    );

const labelMutation = <T>(
    token: new (
        ...args: ConstructorParameters<typeof EditCalendarLabelUseCase>
    ) => T,
) =>
    agendaUseCase(
        token,
        (d) =>
            new token(
                d.labelRepository,
                d.labelPreconditions,
                d.clock,
                d.publishing,
            ),
    );

const useCases = [
    agendaUseCase(
        CreateCalendarEventUseCase,
        (d) =>
            new CreateCalendarEventUseCase(d.repository, d.clock, d.publishing),
    ),
    agendaUseCase(
        ListCalendarEventsUseCase,
        (d) => new ListCalendarEventsUseCase(d.repository),
    ),
    agendaUseCase(
        GetCalendarEventUseCase,
        (d) => new GetCalendarEventUseCase(d.preconditions),
    ),
    mutation(EditCalendarEventUseCase),
    mutation(ShareCalendarEventUseCase),
    mutation(MakeCalendarEventPrivateUseCase),
    mutation(DeleteCalendarEventUseCase),
    agendaUseCase(
        ListCalendarLabelsUseCase,
        (d) => new ListCalendarLabelsUseCase(d.labelRepository),
    ),
    labelMutation(CreateCalendarLabelUseCase),
    labelMutation(EditCalendarLabelUseCase),
    labelMutation(DeleteCalendarLabelUseCase),
];

// Decision 0006: the guard service reading pairing is a provider, injected where the couple of a request is needed.
const agendaCoupleGuardService = {
    provide: AgendaCoupleGuardService,
    inject: [PairedCoupleProvider],
    useFactory: (provider: PairedCoupleProvider) =>
        new AgendaCoupleGuardService(provider),
};

@Module({
    imports: [AgendaSecondaryModule],
    providers: [...useCases, agendaCoupleGuardService],
    exports: [
        AgendaSecondaryModule,
        ...useCases.map(({ provide }) => provide),
        AgendaCoupleGuardService,
    ],
})
export class AgendaServiceModule {}
