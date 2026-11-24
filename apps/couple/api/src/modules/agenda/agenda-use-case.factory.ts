import type { FactoryProvider, Type } from '@nestjs/common';
import {
    CalendarEventPreconditionService,
    CalendarEventRepository,
} from '@cocooning/couple-server-business-logic/agenda';
import { EventPublishingService } from '@cocooning/shared-kernel/application';
import {
    DateTimeProvider,
    EventPublisher,
    Logger,
} from '@cocooning/shared-kernel/ports';

export type AgendaDependencies = {
    readonly repository: CalendarEventRepository;
    readonly preconditions: CalendarEventPreconditionService;
    readonly clock: DateTimeProvider;
    readonly publishing: EventPublishingService;
};

const DEPENDENCIES = [
    CalendarEventRepository,
    DateTimeProvider,
    EventPublisher,
    Logger,
];

// The domain service is created inline, never a provider (decision 0005).
const collect = (
    repository: CalendarEventRepository,
    clock: DateTimeProvider,
    publisher: EventPublisher,
    logger: Logger,
): AgendaDependencies => {
    logger.setContext(EventPublishingService.name);
    return {
        repository,
        preconditions: new CalendarEventPreconditionService(repository),
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
