import { NoteContentRepository } from '../../../domain/ports/note-content.repository';
import type { NoteInMemoryRepository } from './note-in-memory.repository';

const keyOf = (coupleId: string, noteId: string): string =>
    `${coupleId}/${noteId}`;

// Mimics the adapter: the content lives on the note row, so a note of another couple or a deleted one has none.
export class NoteContentInMemoryRepository extends NoteContentRepository {
    private contents: ReadonlyMap<string, Uint8Array> = new Map();

    constructor(private readonly noteRepository: NoteInMemoryRepository) {
        super();
    }

    override findContent(
        coupleId: string,
        noteId: string,
    ): Promise<Uint8Array | null> {
        return Promise.resolve(
            this.contents.get(keyOf(coupleId, noteId)) ?? null,
        );
    }

    override saveContent(
        coupleId: string,
        noteId: string,
        content: Uint8Array,
    ): Promise<void> {
        const live = this.noteRepository.storedSnapshots.some(
            (snapshot) =>
                snapshot.coupleId === coupleId &&
                snapshot.id === noteId &&
                snapshot.metadata.deletedAt === null,
        );
        if (live) {
            this.contents = new Map([
                ...this.contents,
                [keyOf(coupleId, noteId), Uint8Array.from(content)],
            ]);
        }
        return Promise.resolve();
    }
}
