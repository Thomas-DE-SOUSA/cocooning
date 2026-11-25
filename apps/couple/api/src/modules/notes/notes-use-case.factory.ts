import type { FactoryProvider, Type } from '@nestjs/common';
import {
    FolderPreconditionService,
    FolderRepository,
    NoteCollaborationProvider,
    NoteContentRepository,
    NotePreconditionService,
    NoteRepository,
    NoteRevocationService,
} from '@cocooning/couple-server-business-logic/notes';
import { EventPublishingService } from '@cocooning/shared-kernel/application';
import {
    DateTimeProvider,
    EventPublisher,
    Logger,
    UnitOfWork,
} from '@cocooning/shared-kernel/ports';

export type NotesDependencies = {
    readonly repository: NoteRepository;
    readonly folders: FolderRepository;
    readonly contents: NoteContentRepository;
    readonly preconditions: NotePreconditionService;
    readonly folderPreconditions: FolderPreconditionService;
    readonly collaboration: NoteCollaborationProvider;
    readonly revocation: NoteRevocationService;
    readonly unitOfWork: UnitOfWork;
    readonly clock: DateTimeProvider;
    readonly publishing: EventPublishingService;
};

const DEPENDENCIES = [
    NoteRepository,
    FolderRepository,
    NoteContentRepository,
    NoteCollaborationProvider,
    UnitOfWork,
    DateTimeProvider,
    EventPublisher,
    Logger,
];

// The domain services are created inline, never providers (decision 0005).
const collect = (
    repository: NoteRepository,
    folders: FolderRepository,
    contents: NoteContentRepository,
    collaboration: NoteCollaborationProvider,
    unitOfWork: UnitOfWork,
    clock: DateTimeProvider,
    publisher: EventPublisher,
    logger: Logger,
): NotesDependencies => {
    logger.setContext(EventPublishingService.name);
    return {
        repository,
        folders,
        contents,
        preconditions: new NotePreconditionService(repository),
        folderPreconditions: new FolderPreconditionService(folders),
        collaboration,
        revocation: new NoteRevocationService(collaboration),
        unitOfWork,
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
