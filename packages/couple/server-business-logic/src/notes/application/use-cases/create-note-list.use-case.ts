import type {
    NoteListKind,
    NoteSpace,
} from '@cocooning/couple-shared-kernel/enums';
import type { EventPublishingService } from '@cocooning/shared-kernel/application';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import type { DateTimeProvider } from '@cocooning/shared-kernel/ports';
import { Note } from '../../domain/models/note.aggregate';
import type { NoteRepository } from '../../domain/ports/note.repository';
import { NoteList } from '../../domain/value-objects/note-list.vo';
import { NoteListEmoji } from '../../domain/value-objects/note-list-emoji.vo';
import { NoteTitle } from '../../domain/value-objects/note-title.vo';
import {
    type NoteListView,
    toNoteListView,
} from '../mappers/note-list-view.mapper';

export type CreateNoteListCommand = {
    readonly kind: NoteListKind;
    readonly space: NoteSpace;
    readonly title: string;
    readonly emoji: string | null;
};

// R1, R26, R27: a list of a section, owned by its creator, shared or private by its space, at the root.
export class CreateNoteListUseCase {
    constructor(
        private readonly noteRepository: NoteRepository,
        private readonly dateTimeProvider: DateTimeProvider,
        private readonly eventPublishingService: EventPublishingService,
    ) {}

    async execute(
        context: ExecutionContext,
        command: CreateNoteListCommand,
    ): Promise<NoteListView> {
        const title = NoteTitle.create(command.title);
        const emoji = NoteListEmoji.createOptional(command.emoji);
        const note = Note.createList(
            {
                coupleId: context.coupleId,
                ownerId: context.userId,
                title,
                space: command.space,
                list: NoteList.create(command.kind, emoji),
            },
            this.dateTimeProvider.now(),
        );
        await this.noteRepository.save(note);
        await this.eventPublishingService.publishAndClear([note]);
        return toNoteListView(note, context.userId);
    }
}
