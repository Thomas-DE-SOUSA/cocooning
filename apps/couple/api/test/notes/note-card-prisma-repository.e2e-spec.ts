import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { NoteCardRepository } from '@cocooning/couple-server-business-logic/notes';
import { CardRequests, noteDetailOf } from './card-requests';
import { folderOf, FolderRequests } from './folder-requests';
import { NotesTestApp } from './notes-test-app';
import { COUPLE_ID, NOW, OTHER_COUPLE_ID, PARTNER_A } from './notes-test-data';

const SETTINGS = {
    subject: 'Les restaurants',
    cardTemplate: ['Adresse', 'Prix'],
};

describe('Feature: the Prisma adapter of NoteCardRepository', () => {
    const notes = new NotesTestApp();
    const folders = new FolderRequests((userId) => notes.as(userId));
    const cards = new CardRequests((userId) => notes.as(userId));
    const repository = () => notes.provider(NoteCardRepository);

    beforeAll(() => notes.start());
    afterAll(() => notes.stop());
    beforeEach(() => notes.reset());

    // Restaurants (smart) > Lyon, a card in each; a deleted note and its card; a classic folder aside.
    const seed = async () => {
        const restaurants = folderOf(
            await folders.createSmart(PARTNER_A, 'Restaurants', SETTINGS),
        ).folderId;
        const lyon = folderOf(
            await folders.create(PARTNER_A, 'Lyon', 'SHARED', restaurants),
        ).folderId;
        const top = noteDetailOf(
            await cards.add(PARTNER_A, restaurants, 'Le Bouchon'),
        );
        const deep = noteDetailOf(
            await cards.add(PARTNER_A, lyon, 'Chez Paul'),
        );
        const gone = noteDetailOf(await cards.add(PARTNER_A, lyon, 'Fermé'));
        await notes.delete(PARTNER_A, gone.noteId);
        return { restaurants, lyon, top, deep };
    };

    describe('Scenario: R18, R22, the cards of a tree', () => {
        it('reads the cards of the live notes of the folder and its sub-folders, of the couple only', async () => {
            const { restaurants, lyon, top, deep } = await seed();
            const inTree = await repository().findInTree(
                COUPLE_ID,
                restaurants,
            );
            expect(inTree.map((card) => card.noteId).sort()).toEqual(
                [top.noteId, deep.noteId].sort(),
            );
            expect(
                (await repository().findInTree(COUPLE_ID, lyon)).map(
                    (c) => c.noteId,
                ),
            ).toEqual([deep.noteId]);
            await expect(
                repository().findInTree(OTHER_COUPLE_ID, restaurants),
            ).resolves.toEqual([]);
            await expect(
                repository().findByNoteIds(OTHER_COUPLE_ID, [top.noteId]),
            ).resolves.toEqual([]);
            await expect(
                repository().findByNoteId(OTHER_COUPLE_ID, top.noteId),
            ).resolves.toBeNull();
        });
    });

    describe('Scenario: two writes of the same card', () => {
        it('saves several cards at once and refuses a stale one with NOTE_CARD_VERSION_CONFLICT', async () => {
            const { top, deep } = await seed();
            const [first, second] = await repository().findByNoteIds(
                COUPLE_ID,
                [top.noteId, deep.noteId],
            );
            if (first === undefined || second === undefined)
                throw new Error('No card');
            first.fail(NOW);
            second.fail(NOW);
            await repository().saveAll([first, second]);
            const stale = await repository().findByNoteId(
                COUPLE_ID,
                top.noteId,
            );
            const fresh = await repository().findByNoteId(
                COUPLE_ID,
                top.noteId,
            );
            if (stale === null || fresh === null) throw new Error('No card');
            fresh.correctField(PARTNER_A, 'Prix', '25 €', NOW);
            stale.correctField(PARTNER_A, 'Prix', '30 €', NOW);
            await repository().save(fresh);
            await expect(repository().save(stale)).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.NOTE_CARD_VERSION_CONFLICT,
            });
            expect(
                (
                    await repository().findByNoteId(COUPLE_ID, top.noteId)
                )?.toSnapshot(),
            ).toMatchObject({
                status: 'FAILED',
                version: 3,
                fields: [
                    { name: 'Adresse', value: null, isManual: false },
                    { name: 'Prix', value: '25 €', isManual: true },
                ],
            });
        });
    });

    describe('Scenario: a corrupted row', () => {
        it.each([
            ['an unknown status', { status: 'LOST' }],
            ['fields that are not a list', { fields: { a: 1 } }],
        ])('answers NOTE_CARD_DATA_CORRUPTED for %s', async (_label, data) => {
            const { top } = await seed();
            await notes.prisma.includingDeleted.noteCard.updateMany({
                where: { noteId: top.noteId },
                data,
            });
            await expect(
                repository().findByNoteId(COUPLE_ID, top.noteId),
            ).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.NOTE_CARD_DATA_CORRUPTED,
            });
        });
    });
});
