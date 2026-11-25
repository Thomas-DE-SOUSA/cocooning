import {
    FolderKindEnum,
    type NoteSpace,
    NoteSpaceEnum,
} from '@cocooning/couple-shared-kernel/enums';
import { EventPublishingService } from '@cocooning/shared-kernel/application';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import {
    DeterministicDateTimeProvider,
    FakeEventPublisherAdapter,
    FakeLoggerAdapter,
    FakeUuidV7GeneratorProvider,
    InMemoryUnitOfWork,
} from '@cocooning/shared-kernel/testing';
import { AddNoteCardUseCase } from '../../application/use-cases/add-note-card.use-case';
import { ChooseNoteCardCandidateUseCase } from '../../application/use-cases/choose-note-card-candidate.use-case';
import { CorrectNoteCardFieldUseCase } from '../../application/use-cases/correct-note-card-field.use-case';
import { CreateFolderUseCase } from '../../application/use-cases/create-folder.use-case';
import { EnrichPendingNoteCardsUseCase } from '../../application/use-cases/enrich-pending-note-cards.use-case';
import { RefineNoteCardUseCase } from '../../application/use-cases/refine-note-card.use-case';
import { RefreshNoteCardUseCase } from '../../application/use-cases/refresh-note-card.use-case';
import { DeleteFolderUseCase } from '../../application/use-cases/delete-folder.use-case';
import { EditFolderTemplateUseCase } from '../../application/use-cases/edit-folder-template.use-case';
import { GetNoteSpaceContentsUseCase } from '../../application/use-cases/get-note-space-contents.use-case';
import { ListNoteSpacesUseCase } from '../../application/use-cases/list-note-spaces.use-case';
import { MoveFolderUseCase } from '../../application/use-cases/move-folder.use-case';
import { MoveNoteUseCase } from '../../application/use-cases/move-note.use-case';
import { ProposeFolderTemplateUseCase } from '../../application/use-cases/propose-folder-template.use-case';
import { RenameFolderUseCase } from '../../application/use-cases/rename-folder.use-case';
import { Folder } from '../../domain/models/folder.aggregate';
import type { CardFieldValues } from '../../domain/models/card-fields';
import { NoteCard } from '../../domain/models/note-card.aggregate';
import type { CardCandidate } from '../../domain/models/note-card.aggregate.type';
import { createSmartFolderSettings } from '../../domain/models/smart-folder-settings';
import { NoteCardEnrichmentService } from '../../domain/services/note-card-enrichment.service';
import { NoteCardRelocationService } from '../../domain/services/note-card-relocation.service';
import { NoteCardPreconditionService } from '../../domain/services/note-card-precondition.service';
import { CardTemplate } from '../../domain/value-objects/card-template.vo';
import { NoteCardQuery } from '../../domain/value-objects/note-card-query.vo';
import { CardContextService } from '../../domain/services/card-context.service';
import { FolderPreconditionService } from '../../domain/services/folder-precondition.service';
import { NoteRevocationService } from '../../domain/services/note-revocation.service';
import { FolderName } from '../../domain/value-objects/folder-name.vo';
import { AuthorizeNoteDocumentUseCase } from '../../application/use-cases/authorize-note-document.use-case';
import { GetNoteUseCase } from '../../application/use-cases/get-note.use-case';
import { LoadNoteDocumentUseCase } from '../../application/use-cases/load-note-document.use-case';
import { SaveNoteDocumentUseCase } from '../../application/use-cases/save-note-document.use-case';
import { NoteCoupleGuardService } from '../../application/services/note-couple-guard.service';
import { CreateNoteUseCase } from '../../application/use-cases/create-note.use-case';
import { DeleteNoteUseCase } from '../../application/use-cases/delete-note.use-case';
import { ListNotesUseCase } from '../../application/use-cases/list-notes.use-case';
import { MakeNotePrivateUseCase } from '../../application/use-cases/make-note-private.use-case';
import { RenameNoteUseCase } from '../../application/use-cases/rename-note.use-case';
import { ShareNoteUseCase } from '../../application/use-cases/share-note.use-case';
import { Note } from '../../domain/models/note.aggregate';
import { NotePreconditionService } from '../../domain/services/note-precondition.service';
import { NoteId } from '../../domain/value-objects/note-id.vo';
import { NoteTitle } from '../../domain/value-objects/note-title.vo';
import {
    FakeNoteCardWriter,
    PROPOSED_TEMPLATE,
} from '../secondary/adapters/fake-note-card.writer';
import { FakeNoteCollaborationProvider } from '../secondary/adapters/fake-note-collaboration.provider';
import { FakePairedCoupleProvider } from '../secondary/adapters/fake-paired-couple.provider';
import { FakeWebPageReader } from '../secondary/adapters/fake-web-page.reader';
import { FakeWebSearchProvider } from '../secondary/adapters/fake-web-search.provider';
import { NoteCardSearchInMemoryCounter } from '../secondary/adapters/note-card-search-in-memory.counter';
import { NoteCardInMemoryRepository } from '../secondary/adapters/note-card-in-memory.repository';
import { NoteContentInMemoryRepository } from '../secondary/adapters/note-content-in-memory.repository';
import { FolderInMemoryRepository } from '../secondary/adapters/folder-in-memory.repository';
import { NoteInMemoryRepository } from '../secondary/adapters/note-in-memory.repository';

export const NOW = new Date('2026-11-23T10:00:00.000Z');
export const MILLISECONDS_PER_HOUR = 3_600_000;
export const COUPLE_ID = 'c0000000-0000-7000-8000-0000000000c1';
export const OTHER_COUPLE_ID = 'c0000000-0000-7000-8000-0000000000c2';
export const PARTNER_A = 'a0000000-0000-7000-8000-00000000000a';
export const PARTNER_B = 'b0000000-0000-7000-8000-00000000000b';
export const DAILY_SEARCH_LIMIT = 30;
export const ENRICHMENT_BATCH_SIZE = 3;
export const STRANGER = 'd0000000-0000-7000-8000-00000000000d';
export const AS_A: ExecutionContext = {
    coupleId: COUPLE_ID,
    userId: PARTNER_A,
};
export const AS_B: ExecutionContext = {
    coupleId: COUPLE_ID,
    userId: PARTNER_B,
};
export const AS_STRANGER: ExecutionContext = {
    coupleId: OTHER_COUPLE_ID,
    userId: STRANGER,
};

// Configures the process-wide UUID generator, shared by every Uuid subclass: call `NoteId.resetForTests()` in afterEach.
export class NotesTestContext {
    readonly dateTimeProvider = new DeterministicDateTimeProvider(NOW);
    readonly noteRepository = new NoteInMemoryRepository();
    readonly noteContentRepository = new NoteContentInMemoryRepository(
        this.noteRepository,
    );
    readonly folderRepository = new FolderInMemoryRepository(
        this.noteRepository,
    );
    readonly noteCardRepository = new NoteCardInMemoryRepository(
        this.noteRepository,
        this.folderRepository,
    );
    readonly unitOfWork = new InMemoryUnitOfWork();
    readonly pairedCoupleProvider = new FakePairedCoupleProvider();
    readonly noteCollaborationProvider = new FakeNoteCollaborationProvider();
    readonly noteCardWriter = new FakeNoteCardWriter();
    readonly webSearchProvider = new FakeWebSearchProvider();
    readonly webPageReader = new FakeWebPageReader();
    readonly searchCounter = new NoteCardSearchInMemoryCounter();
    readonly eventPublisher = new FakeEventPublisherAdapter();
    readonly logger = new FakeLoggerAdapter();
    private readonly eventPublishingService = new EventPublishingService(
        this.eventPublisher,
        this.logger,
    );
    private readonly preconditions = new NotePreconditionService(
        this.noteRepository,
    );
    private readonly folderPreconditions = new FolderPreconditionService(
        this.folderRepository,
    );
    private readonly cardContexts = new CardContextService(
        this.folderRepository,
    );
    private readonly cardPreconditions = new NoteCardPreconditionService(
        this.noteCardRepository,
    );

    constructor() {
        NoteId.configure(new FakeUuidV7GeneratorProvider());
    }

    noteCoupleGuardService(): NoteCoupleGuardService {
        return new NoteCoupleGuardService(this.pairedCoupleProvider);
    }

    createNoteUseCase(): CreateNoteUseCase {
        return new CreateNoteUseCase(
            this.noteRepository,
            this.folderPreconditions,
            this.dateTimeProvider,
            this.eventPublishingService,
        );
    }

    listNotesUseCase(): ListNotesUseCase {
        return new ListNotesUseCase(this.noteRepository);
    }

    renameNoteUseCase(): RenameNoteUseCase {
        return new RenameNoteUseCase(...this.mutationDependencies());
    }

    shareNoteUseCase(): ShareNoteUseCase {
        return new ShareNoteUseCase(...this.mutationDependencies());
    }

    makeNotePrivateUseCase(): MakeNotePrivateUseCase {
        return new MakeNotePrivateUseCase(...this.revokingDependencies());
    }

    deleteNoteUseCase(): DeleteNoteUseCase {
        return new DeleteNoteUseCase(...this.revokingDependencies());
    }

    moveNoteUseCase(): MoveNoteUseCase {
        return new MoveNoteUseCase(
            this.noteRepository,
            this.noteCardRepository,
            this.preconditions,
            this.folderPreconditions,
            new NoteRevocationService(this.noteCollaborationProvider),
            new NoteCardRelocationService(
                this.noteCardRepository,
                this.cardContexts,
            ),
            this.unitOfWork,
            this.dateTimeProvider,
            this.eventPublishingService,
        );
    }

    createFolderUseCase(): CreateFolderUseCase {
        return new CreateFolderUseCase(...this.folderMutationDependencies());
    }

    renameFolderUseCase(): RenameFolderUseCase {
        return new RenameFolderUseCase(...this.folderMutationDependencies());
    }

    moveFolderUseCase(): MoveFolderUseCase {
        return new MoveFolderUseCase(...this.folderMutationDependencies());
    }

    proposeFolderTemplateUseCase(): ProposeFolderTemplateUseCase {
        return new ProposeFolderTemplateUseCase(
            this.folderRepository,
            this.folderPreconditions,
            this.noteCardWriter,
        );
    }

    editFolderTemplateUseCase(): EditFolderTemplateUseCase {
        return new EditFolderTemplateUseCase(
            this.folderRepository,
            this.noteCardRepository,
            this.folderPreconditions,
            this.cardContexts,
            this.unitOfWork,
            this.dateTimeProvider,
            this.eventPublishingService,
        );
    }

    deleteFolderUseCase(): DeleteFolderUseCase {
        return new DeleteFolderUseCase(
            this.folderRepository,
            this.folderPreconditions,
            this.unitOfWork,
            this.dateTimeProvider,
            this.eventPublishingService,
        );
    }

    getNoteSpaceContentsUseCase(): GetNoteSpaceContentsUseCase {
        return new GetNoteSpaceContentsUseCase(
            this.folderRepository,
            this.noteRepository,
            this.noteCardRepository,
            this.folderPreconditions,
            this.cardContexts,
        );
    }

    listNoteSpacesUseCase(): ListNoteSpacesUseCase {
        return new ListNoteSpacesUseCase(
            this.folderRepository,
            this.noteRepository,
        );
    }

    getNoteUseCase(): GetNoteUseCase {
        return new GetNoteUseCase(this.preconditions, this.noteCardRepository);
    }

    addNoteCardUseCase(): AddNoteCardUseCase {
        return new AddNoteCardUseCase(
            this.noteRepository,
            this.noteCardRepository,
            this.folderPreconditions,
            this.cardContexts,
            this.unitOfWork,
            this.dateTimeProvider,
            this.eventPublishingService,
        );
    }

    chooseNoteCardCandidateUseCase(): ChooseNoteCardCandidateUseCase {
        return new ChooseNoteCardCandidateUseCase(...this.cardDependencies());
    }

    refineNoteCardUseCase(): RefineNoteCardUseCase {
        return new RefineNoteCardUseCase(...this.cardDependencies());
    }

    correctNoteCardFieldUseCase(): CorrectNoteCardFieldUseCase {
        return new CorrectNoteCardFieldUseCase(...this.cardDependencies());
    }

    refreshNoteCardUseCase(): RefreshNoteCardUseCase {
        return new RefreshNoteCardUseCase(
            this.noteCardRepository,
            this.preconditions,
            this.cardPreconditions,
            this.cardContexts,
            this.dateTimeProvider,
            this.eventPublishingService,
        );
    }

    enrichPendingNoteCardsUseCase(): EnrichPendingNoteCardsUseCase {
        return new EnrichPendingNoteCardsUseCase(
            this.noteCardRepository,
            new NoteCardEnrichmentService(
                this.noteCardRepository,
                this.noteRepository,
                this.cardContexts,
                this.searchCounter,
                {
                    webSearchProvider: this.webSearchProvider,
                    webPageReader: this.webPageReader,
                    noteCardWriter: this.noteCardWriter,
                },
                DAILY_SEARCH_LIMIT,
            ),
            this.dateTimeProvider,
            this.eventPublishingService,
            ENRICHMENT_BATCH_SIZE,
        );
    }

    authorizeNoteDocumentUseCase(): AuthorizeNoteDocumentUseCase {
        return new AuthorizeNoteDocumentUseCase(this.preconditions);
    }

    loadNoteDocumentUseCase(): LoadNoteDocumentUseCase {
        return new LoadNoteDocumentUseCase(
            this.noteContentRepository,
            this.preconditions,
        );
    }

    saveNoteDocumentUseCase(): SaveNoteDocumentUseCase {
        return new SaveNoteDocumentUseCase(
            this.noteContentRepository,
            this.dateTimeProvider,
        );
    }

    // A note of the couple, as if already in the database, without events; shared at the root by default.
    givenNoteOf(
        context: ExecutionContext,
        title = 'Courses',
        folder: Folder | null = null,
    ): Note {
        const note = Note.create(
            {
                coupleId: context.coupleId,
                ownerId: context.userId,
                title: NoteTitle.create(title),
                space: folder === null ? NoteSpaceEnum.SHARED : folder.space,
                folder,
            },
            this.dateTimeProvider.now(),
        );
        note.clearDomainEvents();
        this.noteRepository.seed(note);
        return note;
    }

    givenPrivateNoteOf(
        context: ExecutionContext,
        title = 'Idées cadeaux',
    ): Note {
        const note = this.givenNoteOf(context, title);
        note.makePrivate(context.userId, this.dateTimeProvider.now());
        note.clearDomainEvents();
        this.noteRepository.seed(note);
        return note;
    }

    // A folder of the couple, as if already in the database, without events; in « Partagé » at the root by default.
    givenFolderOf(
        context: ExecutionContext,
        name: string,
        parent: Folder | null = null,
        space: NoteSpace = parent === null
            ? NoteSpaceEnum.SHARED
            : parent.space,
    ): Folder {
        const folder = Folder.create(
            {
                coupleId: context.coupleId,
                ownerId: context.userId,
                space,
                parent,
                name: FolderName.create(name),
                kind: FolderKindEnum.CLASSIC,
                settings: null,
            },
            this.dateTimeProvider.now(),
        );
        folder.clearDomainEvents();
        this.folderRepository.seed(folder);
        return folder;
    }

    // A smart folder (R17): at the top of a tree it holds PROPOSED_TEMPLATE, under a smart parent it inherits (R18).
    givenSmartFolderOf(
        context: ExecutionContext,
        name: string,
        parent: Folder | null = null,
        space: NoteSpace = parent === null
            ? NoteSpaceEnum.SHARED
            : parent.space,
    ): Folder {
        const settings =
            parent !== null && parent.kind === FolderKindEnum.SMART
                ? null
                : createSmartFolderSettings(
                      PROPOSED_TEMPLATE.subject,
                      PROPOSED_TEMPLATE.fieldNames,
                  );
        const folder = Folder.create(
            {
                coupleId: context.coupleId,
                ownerId: context.userId,
                space,
                parent,
                name: FolderName.create(name),
                kind: FolderKindEnum.SMART,
                settings,
            },
            this.dateTimeProvider.now(),
        );
        folder.clearDomainEvents();
        this.folderRepository.seed(folder);
        return folder;
    }

    givenPrivateFolderOf(context: ExecutionContext, name: string): Folder {
        return this.givenFolderOf(context, name, null, NoteSpaceEnum.PRIVATE);
    }

    // A card « en recherche » for a note, as if already stored, without events; the template of PROPOSED_TEMPLATE.
    givenCardOf(
        note: Note,
        fieldNames: ReadonlyArray<string> = PROPOSED_TEMPLATE.fieldNames,
    ): NoteCard {
        const card = NoteCard.create(
            {
                coupleId: note.coupleId,
                noteId: note.id,
                requestedBy: note.ownerId,
                query: NoteCardQuery.create(note.title.value),
                template: CardTemplate.create(fieldNames),
            },
            this.dateTimeProvider.now(),
        );
        return this.seedCard(card);
    }

    givenFilledCardOf(
        note: Note,
        values: CardFieldValues,
        sources: ReadonlyArray<string> = [],
    ): NoteCard {
        const card = this.givenCardOf(note);
        card.recordResult(values, sources, this.dateTimeProvider.now());
        return this.seedCard(card);
    }

    givenChoosingCardOf(
        note: Note,
        candidates: ReadonlyArray<CardCandidate>,
    ): NoteCard {
        const card = this.givenCardOf(note);
        card.recordCandidates(candidates, this.dateTimeProvider.now());
        return this.seedCard(card);
    }

    advanceHours(hours: number): void {
        this.dateTimeProvider.advanceBy(hours * MILLISECONDS_PER_HOUR);
    }

    private seedCard(card: NoteCard): NoteCard {
        card.clearDomainEvents();
        this.noteCardRepository.seed(card);
        return NoteCard.fromSnapshot(
            this.noteCardRepository.storedSnapshots.find(
                (stored) => stored.id === card.id.getValue(),
            ) ?? card.toSnapshot(),
        );
    }

    private cardDependencies() {
        return [
            this.noteCardRepository,
            this.preconditions,
            this.cardPreconditions,
            this.dateTimeProvider,
            this.eventPublishingService,
        ] as const;
    }

    private revokingDependencies() {
        return [
            this.noteRepository,
            this.preconditions,
            this.noteCollaborationProvider,
            this.dateTimeProvider,
            this.eventPublishingService,
        ] as const;
    }

    private folderMutationDependencies() {
        return [
            this.folderRepository,
            this.folderPreconditions,
            this.dateTimeProvider,
            this.eventPublishingService,
        ] as const;
    }

    private mutationDependencies() {
        return [
            this.noteRepository,
            this.preconditions,
            this.dateTimeProvider,
            this.eventPublishingService,
        ] as const;
    }
}
