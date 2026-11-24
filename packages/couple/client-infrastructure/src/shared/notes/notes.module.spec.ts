import { FakeFetch } from '@cocooning/client-infrastructure/testing';
import { A_NOTE_PAGE } from '@cocooning/couple-client-business-logic/testing';
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
});
