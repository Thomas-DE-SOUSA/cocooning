import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { FolderRequests, contentsOf } from './folder-requests';
import { listOf, ListRequests } from './list-requests';
import { NotesTestApp } from './notes-test-app';
import {
    NOW,
    PARTNER_A,
    PARTNER_B,
    refusal,
    STRANGER,
} from './notes-test-data';

describe('Feature: the home of a section of the Lists tab (R27, R28)', () => {
    const notes = new NotesTestApp();
    const lists = new ListRequests((userId) => notes.as(userId));
    const folders = new FolderRequests((userId) => notes.as(userId));

    beforeAll(() => notes.start());
    afterAll(() => notes.stop());
    beforeEach(() => notes.reset());

    describe('Scenario: R4, R28, the lists one partner sees', () => {
        it('gives the shared lists and her own private ones, the most recently changed first', async () => {
            const carrefour = await lists.createdListId(PARTNER_A, 'Carrefour');
            notes.advanceMinutes(1);
            const marche = listOf(
                await lists.create(
                    PARTNER_B,
                    'Marché',
                    'PRIVATE',
                    'GROCERIES',
                    null,
                ),
            );
            await lists.create(PARTNER_A, 'Pharmacie', 'PRIVATE');
            await lists.create(PARTNER_A, 'Noël', 'SHARED', 'TASKS');
            expect(await lists.index(PARTNER_B, 'GROCERIES')).toEqual({
                status: 200,
                body: {
                    items: [
                        marche,
                        {
                            noteId: carrefour,
                            title: 'Carrefour',
                            emoji: '🛒',
                            visibility: 'SHARED',
                            isOwner: false,
                            openItemCount: 0,
                            updatedAt: NOW.toISOString(),
                        },
                    ],
                },
            });
        });

        it('gives another couple none of them', async () => {
            await lists.create(PARTNER_A, 'Carrefour');
            expect(await lists.index(STRANGER, 'GROCERIES')).toEqual({
                status: 200,
                body: { items: [] },
            });
        });

        it('refuses an unknown or missing section with 422', async () => {
            expect((await lists.index(PARTNER_A, 'WISHES')).status).toBe(422);
            expect((await lists.index(PARTNER_A, '')).status).toBe(422);
        });
    });

    describe('Scenario: R27, a list is absent from the notes home', () => {
        it('is not in « Modifiées récemment », in the counts of the spaces, or at their root', async () => {
            await lists.create(PARTNER_A, 'Carrefour');
            await lists.create(PARTNER_A, 'Pharmacie', 'PRIVATE');
            const noteId = await notes.createdNoteId(PARTNER_A, 'Idées');
            expect((await notes.list(PARTNER_A)).body).toMatchObject({
                items: [{ noteId }],
                total: 1,
            });
            expect((await folders.spaces(PARTNER_A)).body).toEqual({
                spaces: [
                    { space: 'SHARED', folderCount: 0, noteCount: 1 },
                    { space: 'PRIVATE', folderCount: 0, noteCount: 0 },
                ],
            });
            const root = contentsOf(
                await folders.contents(PARTNER_A, 'SHARED'),
            );
            expect(root.notes.map((note) => note.noteId)).toEqual([noteId]);
        });

        it('opens like a note, with its section and emoji (R26)', async () => {
            const noteId = await lists.createdListId(PARTNER_A, 'Carrefour');
            expect((await notes.get(PARTNER_B, noteId)).body).toMatchObject({
                noteId,
                title: 'Carrefour',
                listKind: 'GROCERIES',
                emoji: '🛒',
                card: null,
            });
        });

        it('refuses to be filed into a folder with 422 NOTE_LIST_NOT_MOVABLE', async () => {
            const noteId = await lists.createdListId(PARTNER_A, 'Carrefour');
            const folderId = await folders.createdId(PARTNER_A, 'Maison');
            expect(
                await folders.moveNote(PARTNER_B, noteId, 'SHARED', folderId),
            ).toEqual(
                refusal(
                    422,
                    NoteExceptionCodeEnum.NOTE_LIST_NOT_MOVABLE,
                    'A list is never moved into a folder',
                ),
            );
        });

        it('is deleted by its owner through the note route, and leaves the home', async () => {
            const noteId = await lists.createdListId(PARTNER_A, 'Carrefour');
            expect((await notes.delete(PARTNER_A, noteId)).status).toBe(204);
            expect((await lists.index(PARTNER_B, 'GROCERIES')).body).toEqual({
                items: [],
            });
        });
    });
});
