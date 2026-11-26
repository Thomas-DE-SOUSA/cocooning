import type { FactoryProvider, Type } from '@nestjs/common';
import {
    CalendarEventPreconditionService,
    CalendarEventRepository,
    CalendarLabelPreconditionService,
    CalendarLabelRepository,
} from '@cocooning/couple-server-business-logic/agenda';
import { EventPublishingService } from '@cocooning/shared-kernel/application';
import {
    DateTimeProvider,
    EventPublisher,
    Logger,
    UnitOfWork,
} from '@cocooning/shared-kernel/ports';

export type AgendaDependencies = {
    readonly repository: CalendarEventRepository;
    readonly preconditions: CalendarEventPreconditionService;
    readonly labelRepository: CalendarLabelRepository;
    readonly labelPreconditions: CalendarLabelPreconditionService;
    readonly unitOfWork: UnitOfWork;
    readonly clock: DateTimeProvider;
    readonly publishing: EventPublishingService;
};

const DEPENDENCIES = [
    CalendarEventRepository,
    CalendarLabelRepository,
    UnitOfWork,
    DateTimeProvider,
    EventPublisher,
    Logger,
];

// The domain services are created inline, never providers (decision 0005).
const collect = (
    repository: CalendarEventRepository,
    labelRepository: CalendarLabelRepository,
    unitOfWork: UnitOfWork,
    clock: DateTimeProvider,
    publisher: EventPublisher,
    logger: Logger,
): AgendaDependencies => {
    logger.setContext(EventPublishingService.name);
    return {
        repository,
        preconditions: new CalendarEventPreconditionService(repository),
        labelRepository,
        labelPreconditions: new CalendarLabelPreconditionService(
            labelRepository,
        ),
        unitOfWork,
        clock,
        publishing: new EventPublishingService(publisher, logger),
    };
};

// A typed token: pairing one use case's token with another's factory does not compile.
export const agendaUseCase = <T>(
    provide: Type<T>,
    build: (dependencies: AgendaDependencies) => T,
): FactoryProvider<T> => ({
    provide,
    inject: DEPENDENCIES,
    useFactory: (...args: Parameters<typeof collect>) =>
        build(collect(...args)),
});
