import type { EventPublishingService } from '@cocooning/shared-kernel/application';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import type { DateTimeProvider } from '@cocooning/shared-kernel/ports';
import type { NoteRepository } from '../../domain/ports/note.repository';
import type { NotePreconditionService } from '../../domain/services/note-precondition.service';
import { NoteListEmoji } from '../../domain/value-objects/note-list-emoji.vo';
import { NoteTitle } from '../../domain/value-objects/note-title.vo';
import {
    type NoteListView,
    toNoteListView,
} from '../mappers/note-list-view.mapper';

export type EditNoteListCommand = {
    readonly noteId: string;
    readonly title: string;
    readonly emoji: string | null;
};

// R4, R6, R26: whoever sees the list changes its title and its emoji; an ordinary note is not a list.
export class EditNoteListUseCase {
    constructor(
        private readonly noteRepository: NoteRepository,
        private readonly notePreconditionService: NotePreconditionService,
        private readonly dateTimeProvider: DateTimeProvider,
        private readonly eventPublishingService: EventPublishingService,
    ) {}

    async execute(
        context: ExecutionContext,
        command: EditNoteListCommand,
    ): Promise<NoteListView> {
        const note = await this.notePreconditionService.loadVisibleNote(
            context,
            command.noteId,
        );
        const title = NoteTitle.create(command.title);
        const emoji = NoteListEmoji.createOptional(command.emoji);
        note.editList(
            context.userId,
            title,
            emoji,
            this.dateTimeProvider.now(),
        );
        await this.noteRepository.save(note);
        await this.eventPublishingService.publishAndClear([note]);
        return toNoteListView(note, context.userId);
    }
}
