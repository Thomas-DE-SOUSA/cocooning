import { EventPublishingService } from '@cocooning/shared-kernel/application';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import {
    DeterministicDateTimeProvider,
    FakeEventPublisherAdapter,
    FakeLoggerAdapter,
    FakeUuidV7GeneratorProvider,
} from '@cocooning/shared-kernel/testing';
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
import { FakePairedCoupleProvider } from '../secondary/adapters/fake-paired-couple.provider';
import { NoteInMemoryRepository } from '../secondary/adapters/note-in-memory.repository';

export const NOW = new Date('2026-11-23T10:00:00.000Z');
export const MILLISECONDS_PER_HOUR = 3_600_000;
export const COUPLE_ID = 'c0000000-0000-7000-8000-0000000000c1';
export const OTHER_COUPLE_ID = 'c0000000-0000-7000-8000-0000000000c2';
export const PARTNER_A = 'a0000000-0000-7000-8000-00000000000a';
export const PARTNER_B = 'b0000000-0000-7000-8000-00000000000b';
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

// Configures the process-wide UUID generator: call `NoteId.resetForTests()` in afterEach.
export class NotesTestContext {
    readonly dateTimeProvider = new DeterministicDateTimeProvider(NOW);
    readonly noteRepository = new NoteInMemoryRepository();
    readonly pairedCoupleProvider = new FakePairedCoupleProvider();
    readonly eventPublisher = new FakeEventPublisherAdapter();
    readonly logger = new FakeLoggerAdapter();
    private readonly eventPublishingService = new EventPublishingService(
        this.eventPublisher,
        this.logger,
    );
    private readonly preconditions = new NotePreconditionService(
        this.noteRepository,
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
        return new MakeNotePrivateUseCase(...this.mutationDependencies());
    }

    deleteNoteUseCase(): DeleteNoteUseCase {
        return new DeleteNoteUseCase(...this.mutationDependencies());
    }

    // A note of the couple, as if already in the database, without events.
    givenNoteOf(context: ExecutionContext, title = 'Courses'): Note {
        const note = Note.create(
            {
                coupleId: context.coupleId,
                ownerId: context.userId,
                title: NoteTitle.create(title),
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

    advanceHours(hours: number): void {
        this.dateTimeProvider.advanceBy(hours * MILLISECONDS_PER_HOUR);
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
