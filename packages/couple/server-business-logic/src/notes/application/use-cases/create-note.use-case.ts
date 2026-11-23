import type { EventPublishingService } from '@cocooning/shared-kernel/application';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import type { DateTimeProvider } from '@cocooning/shared-kernel/ports';
import type { NoteRepository } from '../../domain/ports/note.repository';
import { Note } from '../../domain/models/note.aggregate';
import { NoteTitle } from '../../domain/value-objects/note-title.vo';
import { type NoteView, toNoteView } from '../mappers/note-view.mapper';

export type CreateNoteCommand = {
    readonly title: string;
};

export class CreateNoteUseCase {
    constructor(
        private readonly noteRepository: NoteRepository,
        private readonly dateTimeProvider: DateTimeProvider,
        private readonly eventPublishingService: EventPublishingService,
    ) {}

    async execute(
        context: ExecutionContext,
        command: CreateNoteCommand,
    ): Promise<NoteView> {
        const title = NoteTitle.create(command.title);
        const note = Note.create(
            { coupleId: context.coupleId, ownerId: context.userId, title },
            this.dateTimeProvider.now(),
        );
        await this.noteRepository.save(note);
        await this.eventPublishingService.publishAndClear([note]);
        return toNoteView(note);
    }
}
