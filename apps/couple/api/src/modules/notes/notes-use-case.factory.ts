import type { FactoryProvider, Type } from '@nestjs/common';
import {
    CardContextService,
    FolderPreconditionService,
    FolderRepository,
    NoteCardPreconditionService,
    NoteCardRepository,
    NoteCardWriter,
    NoteChecklistReader,
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
    readonly checklist: NoteChecklistReader;
    readonly cards: NoteCardRepository;
    readonly cardPreconditions: NoteCardPreconditionService;
    readonly preconditions: NotePreconditionService;
    readonly folderPreconditions: FolderPreconditionService;
    readonly cardContexts: CardContextService;
    readonly writer: NoteCardWriter;
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
    NoteChecklistReader,
    NoteCardRepository,
    NoteCollaborationProvider,
    NoteCardWriter,
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
    checklist: NoteChecklistReader,
    cards: NoteCardRepository,
    collaboration: NoteCollaborationProvider,
    writer: NoteCardWriter,
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
        checklist,
        cards,
        cardPreconditions: new NoteCardPreconditionService(cards),
        preconditions: new NotePreconditionService(repository),
        folderPreconditions: new FolderPreconditionService(folders),
        cardContexts: new CardContextService(folders),
        writer,
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
