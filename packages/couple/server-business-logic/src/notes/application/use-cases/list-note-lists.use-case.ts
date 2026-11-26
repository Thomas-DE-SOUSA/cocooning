import type { NoteListKind } from '@cocooning/couple-shared-kernel/enums';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import type { NoteRepository } from '../../domain/ports/note.repository';
import {
    type NoteListView,
    toNoteListViews,
} from '../mappers/note-list-view.mapper';

export type ListNoteListsCommand = {
    readonly kind: NoteListKind;
};

// R4, R28: the shared lists of a section and the partner's own private ones, most recently changed first.
export class ListNoteListsUseCase {
    constructor(private readonly noteRepository: NoteRepository) {}

    async execute(
        context: ExecutionContext,
        command: ListNoteListsCommand,
    ): Promise<ReadonlyArray<NoteListView>> {
        const lists = await this.noteRepository.findVisibleLists(
            context.coupleId,
            context.userId,
            command.kind,
        );
        return toNoteListViews(lists, context.userId);
    }
}
