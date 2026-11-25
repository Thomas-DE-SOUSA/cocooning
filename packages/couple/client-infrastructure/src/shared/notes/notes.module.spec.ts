import { FakeFetch } from '@cocooning/client-infrastructure/testing';
import {
    A_FILLED_NOTE_CARD,
    A_NOTE_PAGE,
    A_SHARED_FOLDER,
    THE_NOTE_SPACES,
} from '@cocooning/couple-client-business-logic/testing';
import { ok } from '@cocooning/shared-kernel/utils';
import { createNotesModule } from './notes.module';

describe('Feature: the web app builds the notes use cases', () => {
    let fakeFetch: FakeFetch;

    beforeEach(() => {
        fakeFetch = new FakeFetch();
        fakeFetch.install();
    });
    afterEach(() => fakeFetch.restore());

    it('reads the session only when a use case runs', async () => {
        const reads: string[] = [];
        const notes = createNotesModule('http://api.test', 5000, () => {
            reads.push('session');
            return Promise.resolve('session-token-1');
        });
        expect(reads).toEqual([]);

        fakeFetch.givenResponse(200, JSON.stringify(A_NOTE_PAGE));
        await notes.listNotes.execute({ page: 1, pageSize: 25 });

        expect(reads).toEqual(['session']);
    });

    it('wires the spaces and folders use cases to the API (decision 0052)', async () => {
        const notes = createNotesModule('http://api.test', 5000, () =>
            Promise.resolve('session-token-1'),
        );

        fakeFetch.givenResponse(200, JSON.stringify(THE_NOTE_SPACES));
        await expect(notes.listNoteSpaces.execute()).resolves.toEqual(
            ok(THE_NOTE_SPACES),
        );
        fakeFetch.givenResponse(204, '');
        await notes.deleteFolder.execute(A_SHARED_FOLDER.folderId);

        expect(fakeFetch.calls.map(({ url }) => url)).toEqual([
            'http://api.test/note-spaces',
            `http://api.test/note-folders/${A_SHARED_FOLDER.folderId}`,
        ]);
    });

    it('wires the note card use cases to the API (R19 to R22)', async () => {
        const notes = createNotesModule('http://api.test', 5000, () =>
            Promise.resolve('session-token-1'),
        );
        const noteId = A_FILLED_NOTE_CARD.noteId;

        fakeFetch.givenResponse(200, JSON.stringify(A_FILLED_NOTE_CARD));
        await expect(notes.refreshNoteCard.execute(noteId)).resolves.toEqual(
            ok(A_FILLED_NOTE_CARD),
        );

        expect(fakeFetch.calls.map(({ url }) => url)).toEqual([
            `http://api.test/notes/${noteId}/card/refresh`,
        ]);
    });
});
