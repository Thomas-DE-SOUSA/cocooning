import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import {
    COUPLE_ID,
    OF_ANOTHER_COUPLE,
    PARTNER_A,
    PARTNER_B,
    PRIVATE_OF_A,
    SHARED_OF_B,
    STRANGER,
} from './note-repository-test-data';
import { NotesAdapterTestApp } from './notes-adapter-test-app';

describe('Feature: the Prisma adapter of NoteRepository, reads', () => {
    const notes = new NotesAdapterTestApp();

    beforeAll(() => notes.start());
    afterAll(() => notes.stop());
    beforeEach(() => notes.reset());

    describe('Scenario: R4, visibility and couple isolation in the query', () => {
        it('lists the shared notes and the own private notes, most recent first', async () => {
            expect(await notes.titlesSeenBy(COUPLE_ID, PARTNER_A)).toEqual([
                'Vacances',
                'Idées cadeaux',
                'Courses',
            ]);
            expect(await notes.titlesSeenBy(COUPLE_ID, PARTNER_B)).toEqual([
                'Vacances',
                'Courses',
            ]);
        });

        it('never gives a note of another couple (core-backend.md rule 12)', async () => {
            expect(await notes.titlesSeenBy(COUPLE_ID, STRANGER)).toEqual([
                'Vacances',
                'Courses',
            ]);
            await expect(
                notes.repository.findVisibleById(
                    COUPLE_ID,
                    PARTNER_A,
                    OF_ANOTHER_COUPLE.noteId,
                ),
            ).resolves.toBeNull();
        });

        it('answers null for the private note of the other partner', async () => {
            await expect(
                notes.repository.findVisibleById(
                    COUPLE_ID,
                    PARTNER_B,
                    PRIVATE_OF_A.noteId,
                ),
            ).resolves.toBeNull();
            const own = await notes.repository.findVisibleById(
                COUPLE_ID,
                PARTNER_A,
                PRIVATE_OF_A.noteId,
            );
            expect(own?.title.value).toBe('Idées cadeaux');
        });
    });

    describe('Scenario: a corrupted row', () => {
        it('refuses an unknown visibility of an own note with NOTE_DATA_CORRUPTED', async () => {
            await notes.prisma.includingDeleted.note.update({
                where: { id: SHARED_OF_B.noteId },
                data: { visibility: 'PUBLIC' },
            });
            await expect(
                notes.repository.findVisible(COUPLE_ID, PARTNER_B, {
                    page: 1,
                    pageSize: 25,
                }),
            ).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.NOTE_DATA_CORRUPTED,
            });
        });
    });

    describe('Scenario: decision 0025, one page of the list', () => {
        it('gives the page asked for and the total of visible notes', async () => {
            const page = await notes.repository.findVisible(
                COUPLE_ID,
                PARTNER_A,
                {
                    page: 2,
                    pageSize: 2,
                },
            );
            expect(page).toMatchObject({ total: 3, page: 2, pageSize: 2 });
            expect(page.items.map((note) => note.title.value)).toEqual([
                'Courses',
            ]);
        });
    });
});
