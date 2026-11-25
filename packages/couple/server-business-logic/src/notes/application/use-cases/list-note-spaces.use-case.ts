import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import type { FolderRepository } from '../../domain/ports/folder.repository';
import type { NoteRepository } from '../../domain/ports/note.repository';
import {
    type NoteSpacesView,
    toNoteSpacesView,
} from '../mappers/note-spaces-view.mapper';

// R10: the home screen of the notes, « Partagé » and the partner's own « Privé », with what each holds.
export class ListNoteSpacesUseCase {
    constructor(
        private readonly folderRepository: FolderRepository,
        private readonly noteRepository: NoteRepository,
    ) {}

    async execute(context: ExecutionContext): Promise<NoteSpacesView> {
        const folderCounts = await this.folderRepository.countVisibleBySpace(
            context.coupleId,
            context.userId,
        );
        const noteCounts = await this.noteRepository.countVisibleBySpace(
            context.coupleId,
            context.userId,
        );
        return toNoteSpacesView(folderCounts, noteCounts);
    }
}
