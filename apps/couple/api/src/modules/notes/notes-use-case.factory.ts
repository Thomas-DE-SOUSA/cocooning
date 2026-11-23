import type { FactoryProvider, Type } from '@nestjs/common';
import {
    NotePreconditionService,
    NoteRepository,
} from '@cocooning/couple-server-business-logic/notes';
import { EventPublishingService } from '@cocooning/shared-kernel/application';
import {
    DateTimeProvider,
    EventPublisher,
    Logger,
} from '@cocooning/shared-kernel/ports';

export type NotesDependencies = {
    readonly repository: NoteRepository;
    readonly preconditions: NotePreconditionService;
    readonly clock: DateTimeProvider;
    readonly publishing: EventPublishingService;
};

const DEPENDENCIES = [NoteRepository, DateTimeProvider, EventPublisher, Logger];

// The domain service is created inline, never a provider (decision 0005).
const collect = (
    repository: NoteRepository,
    clock: DateTimeProvider,
    publisher: EventPublisher,
    logger: Logger,
): NotesDependencies => {
    logger.setContext(EventPublishingService.name);
    return {
        repository,
        preconditions: new NotePreconditionService(repository),
        clock,
        publishing: new EventPublishingService(publisher, logger),
    };
};

// A typed token: pairing one use case's token with another's factory does not compile.
export const notesUseCase = <T>(
    provide: Type<T>,
    build: (dependencies: NotesDependencies) => T,
): FactoryProvider<T> => ({
    provide,
    inject: DEPENDENCIES,
    useFactory: (...args: Parameters<typeof collect>) =>
        build(collect(...args)),
});
