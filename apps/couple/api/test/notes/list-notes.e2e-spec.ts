import { NotesTestApp } from './notes-test-app';
import { PARTNER_A, PARTNER_B, STRANGER } from './notes-test-data';
import type { TestResponse } from '../shared/app/test-client';

const titlesOf = (response: TestResponse): string[] =>
    (response.body as { items: { title: string }[] }).items.map(
        ({ title }) => title,
    );

describe('Feature: a partner lists the notes of the couple (R4)', () => {
    const notes = new NotesTestApp();

    beforeAll(() => notes.start());
    afterAll(() => notes.stop());
    beforeEach(() => notes.reset());

    beforeEach(async () => {
        await notes.create(PARTNER_A, 'Courses');
        notes.advanceMinutes(1);
        const secret = await notes.createdNoteId(PARTNER_A, 'Idées cadeaux');
        await notes.makePrivate(PARTNER_A, secret);
        notes.advanceMinutes(1);
        await notes.create(PARTNER_B, 'Vacances');
    });

    it('answers 200 with the shared notes and the own private ones, most recent first', async () => {
        const response = await notes.list(PARTNER_A);
        expect(response.status).toBe(200);
        expect(titlesOf(response)).toEqual([
            'Vacances',
            'Idées cadeaux',
            'Courses',
        ]);
        expect(response.body).toMatchObject({
            total: 3,
            page: 1,
            pageSize: 25,
        });
    });

    it('hides the private note of the other partner', async () => {
        expect(titlesOf(await notes.list(PARTNER_B))).toEqual([
            'Vacances',
            'Courses',
        ]);
    });

    it('tells each partner which notes are theirs (R5, R7)', async () => {
        const response = await notes.list(PARTNER_B);
        expect(
            (response.body as { items: { isOwner: boolean }[] }).items.map(
                ({ isOwner }) => isOwner,
            ),
        ).toEqual([true, false]);
    });

    it('shows nothing of the couple to another couple (core.md rule 27)', async () => {
        expect(titlesOf(await notes.list(STRANGER))).toEqual([]);
    });

    it('answers the page asked for (decision 0025)', async () => {
        const response = await notes.list(PARTNER_A, '?page=2&pageSize=2');
        expect(titlesOf(response)).toEqual(['Courses']);
        expect(response.body).toMatchObject({ total: 3, page: 2, pageSize: 2 });
    });

    it('refuses a page size above the maximum with 422', async () => {
        expect((await notes.list(PARTNER_A, '?pageSize=101')).status).toBe(422);
    });
});
