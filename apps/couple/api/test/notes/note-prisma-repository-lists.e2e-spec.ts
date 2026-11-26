import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import {
    NoteListKindEnum,
    NoteSpaceEnum,
} from '@cocooning/couple-shared-kernel/enums';
import {
    COUPLE_ID,
    GROCERIES_OF_A,
    OTHER_COUPLE_ID,
    PARTNER_A,
    PARTNER_B,
    PRIVATE_GROCERIES_OF_B,
    STRANGER,
    TASKS_OF_A,
} from './note-repository-test-data';
import { NotesAdapterTestApp } from './notes-adapter-test-app';

describe('Feature: the Prisma adapter of NoteRepository, lists (R26 to R28)', () => {
    const notes = new NotesAdapterTestApp();

    beforeAll(() => notes.start());
    afterAll(() => notes.stop());
    beforeEach(() => notes.reset());

    const titlesOfLists = async (
        coupleId: string,
        userId: string,
        kind: (typeof NoteListKindEnum)[keyof typeof NoteListKindEnum],
    ) =>
        (await notes.repository.findVisibleLists(coupleId, userId, kind)).map(
            (note) => note.title.value,
        );

    describe('Scenario: R4, R28, the lists of a section, in the query', () => {
        it('gives the shared lists and the own private ones, most recent first', async () => {
            expect(
                await titlesOfLists(
                    COUPLE_ID,
                    PARTNER_B,
                    NoteListKindEnum.GROCERIES,
                ),
            ).toEqual(['Pharmacie', 'Carrefour']);
            expect(
                await titlesOfLists(
                    COUPLE_ID,
                    PARTNER_A,
                    NoteListKindEnum.GROCERIES,
                ),
            ).toEqual(['Carrefour']);
            expect(
                await titlesOfLists(
                    COUPLE_ID,
                    PARTNER_A,
                    NoteListKindEnum.TASKS,
                ),
            ).toEqual(['Noël']);
        });

        it('never gives a list of another couple', async () => {
            expect(
                await titlesOfLists(
                    COUPLE_ID,
                    STRANGER,
                    NoteListKindEnum.GROCERIES,
                ),
            ).toEqual(['Carrefour']);
            expect(
                await titlesOfLists(
                    OTHER_COUPLE_ID,
                    PARTNER_A,
                    NoteListKindEnum.GROCERIES,
                ),
            ).toEqual(['Autre liste']);
        });

        it('reads the section, the emoji and the count of a list', async () => {
            const list = await notes.visibleNote(
                COUPLE_ID,
                PARTNER_A,
                GROCERIES_OF_A.noteId,
            );
            expect(list.toSnapshot()).toMatchObject({
                listKind: NoteListKindEnum.GROCERIES,
                emoji: '🛒',
                openItemCount: 3,
            });
        });
    });

    describe('Scenario: R27, the reads of the notes home leave the lists out', () => {
        it('lists, counts and shows ordinary notes only', async () => {
            expect(await notes.titlesSeenBy(COUPLE_ID, PARTNER_A)).toEqual([
                'Vacances',
                'Idées cadeaux',
                'Courses',
            ]);
            await expect(
                notes.repository.countVisibleBySpace(COUPLE_ID, PARTNER_B),
            ).resolves.toEqual({ SHARED: 2, PRIVATE: 0 });
            const root = await notes.repository.findVisibleIn(
                COUPLE_ID,
                PARTNER_A,
                NoteSpaceEnum.SHARED,
                null,
            );
            expect(root.map((note) => note.title.value)).toEqual([
                'Vacances',
                'Courses',
            ]);
        });
    });

    describe('Scenario: R28, a save of the list keeps the count of its document', () => {
        it('writes the title without touching the count', async () => {
            const list = await notes.visibleNote(
                COUPLE_ID,
                PARTNER_A,
                TASKS_OF_A.noteId,
            );
            await notes.prisma.includingDeleted.note.update({
                where: { id: TASKS_OF_A.noteId },
                data: { openItemCount: 5 },
            });
            list.clearDomainEvents();
            await notes.repository.save(list);
            const row = await notes.prisma.includingDeleted.note.findFirst({
                where: { id: TASKS_OF_A.noteId },
                select: { openItemCount: true, version: true },
            });
            expect(row).toEqual({ openItemCount: 5, version: 2 });
        });
    });

    describe('Scenario: a corrupted row', () => {
        it('refuses an unknown section with NOTE_DATA_CORRUPTED', async () => {
            await notes.prisma.includingDeleted.note.update({
                where: { id: PRIVATE_GROCERIES_OF_B.noteId },
                data: { listKind: 'WISHES' },
            });
            await expect(
                notes.repository.findVisibleById(
                    COUPLE_ID,
                    PARTNER_B,
                    PRIVATE_GROCERIES_OF_B.noteId,
                ),
            ).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.NOTE_DATA_CORRUPTED,
            });
        });
    });
});
