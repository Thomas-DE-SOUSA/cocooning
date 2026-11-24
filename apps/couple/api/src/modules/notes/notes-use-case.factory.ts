import type { FactoryProvider, Type } from '@nestjs/common';
import {
    NoteCollaborationProvider,
    NoteContentRepository,
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
    readonly contents: NoteContentRepository;
    readonly preconditions: NotePreconditionService;
    readonly collaboration: NoteCollaborationProvider;
    readonly clock: DateTimeProvider;
    readonly publishing: EventPublishingService;
};

const DEPENDENCIES = [
    NoteRepository,
    NoteContentRepository,
    NoteCollaborationProvider,
    DateTimeProvider,
    EventPublisher,
    Logger,
];

// The domain service is created inline, never a provider (decision 0005).
const collect = (
    repository: NoteRepository,
    contents: NoteContentRepository,
    collaboration: NoteCollaborationProvider,
    clock: DateTimeProvider,
    publisher: EventPublisher,
    logger: Logger,
): NotesDependencies => {
    logger.setContext(EventPublishingService.name);
    return {
        repository,
        contents,
        preconditions: new NotePreconditionService(repository),
        collaboration,
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
