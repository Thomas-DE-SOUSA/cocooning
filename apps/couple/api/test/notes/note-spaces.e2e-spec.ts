import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { readNoteEvents } from '@cocooning/couple-e2e-shared/fixtures';
import {
    NoteMadePrivateEvent,
    NoteMovedEvent,
} from '@cocooning/couple-server-business-logic/notes';
import { contentsOf, FolderRequests } from './folder-requests';
import { NotesTestApp } from './notes-test-app';
import {
    noteOf,
    NOW,
    PARTNER_A,
    PARTNER_B,
    refusal,
    STRANGER,
} from './notes-test-data';

describe('Feature: the two spaces of the notes and their content (R10 to R12)', () => {
    const notes = new NotesTestApp();
    const folders = new FolderRequests((userId) => notes.as(userId));

    beforeAll(() => notes.start());
    afterAll(() => notes.stop());
    beforeEach(() => notes.reset());

    describe('Scenario: R10, R12, the home screen of each partner', () => {
        it('counts what each partner sees in « Partagé » and in their own « Privé »', async () => {
            const restaurants = await folders.createdId(
                PARTNER_A,
                'Restaurants',
            );
            await folders.createNote(
                PARTNER_B,
                'Chez Luigi',
                'SHARED',
                restaurants,
            );
            await notes.create(PARTNER_A, 'Courses');
            await folders.create(PARTNER_A, 'Cadeaux', 'PRIVATE');
            await folders.createNote(PARTNER_A, 'Montre', 'PRIVATE', null);
            expect(await folders.spaces(PARTNER_A)).toEqual({
                status: 200,
                body: {
                    spaces: [
                        { space: 'SHARED', folderCount: 1, noteCount: 2 },
                        { space: 'PRIVATE', folderCount: 1, noteCount: 1 },
                    ],
                },
            });
            expect(await folders.spaces(PARTNER_B)).toEqual({
                status: 200,
                body: {
                    spaces: [
                        { space: 'SHARED', folderCount: 1, noteCount: 2 },
                        { space: 'PRIVATE', folderCount: 0, noteCount: 0 },
                    ],
                },
            });
            expect((await folders.spaces(STRANGER)).body).toEqual({
                spaces: [
                    { space: 'SHARED', folderCount: 0, noteCount: 0 },
                    { space: 'PRIVATE', folderCount: 0, noteCount: 0 },
                ],
            });
        });
    });

    describe('Scenario: R10, R13, a folder opened deep in « Partagé »', () => {
        it('answers 200 with the way from the root, its folders with their counts and its notes', async () => {
            const sorties = await folders.createdId(PARTNER_A, 'Sorties');
            const restaurants = await folders.createdId(
                PARTNER_A,
                'Restaurants',
                'SHARED',
                sorties,
            );
            const italiens = await folders.createdId(
                PARTNER_B,
                'Italiens',
                'SHARED',
                restaurants,
            );
            await folders.createNote(
                PARTNER_B,
                'Chez Luigi',
                'SHARED',
                italiens,
            );
            const note = noteOf(
                await folders.createNote(
                    PARTNER_A,
                    'À tester',
                    'SHARED',
                    restaurants,
                ),
            );
            expect(
                await folders.contents(PARTNER_B, 'SHARED', restaurants),
            ).toEqual({
                status: 200,
                body: {
                    space: 'SHARED',
                    path: [
                        { folderId: sorties, name: 'Sorties' },
                        { folderId: restaurants, name: 'Restaurants' },
                    ],
                    cardContext: null,
                    folders: [
                        {
                            folderId: italiens,
                            space: 'SHARED',
                            kind: 'CLASSIC',
                            parentFolderId: restaurants,
                            name: 'Italiens',
                            subject: null,
                            cardTemplate: null,
                            updatedAt: NOW.toISOString(),
                            folderCount: 0,
                            noteCount: 1,
                        },
                    ],
                    notes: [
                        {
                            noteId: note.noteId,
                            ownerId: PARTNER_A,
                            isOwner: false,
                            title: 'À tester',
                            visibility: 'SHARED',
                            folderId: restaurants,
                            updatedAt: NOW.toISOString(),
                            card: null,
                            listKind: null,
                            emoji: null,
                        },
                    ],
                },
            });
        });

        it('refuses with 422 a folder opened under the other space or an unknown space', async () => {
            const restaurants = await folders.createdId(
                PARTNER_A,
                'Restaurants',
            );
            expect(
                await folders.contents(PARTNER_A, 'PRIVATE', restaurants),
            ).toEqual(
                refusal(
                    422,
                    NoteExceptionCodeEnum.FOLDER_SPACE_MISMATCH,
                    'The folder is not in this space',
                ),
            );
            expect(
                (await notes.as(PARTNER_A).get('/note-spaces/BOTH/contents'))
                    .status,
            ).toBe(422);
        });
    });

    describe('Scenario: R11, the owner moves her note into a folder of her « Privé »', () => {
        it('answers 200, the note private and out of the other partner’s sight', async () => {
            const noteId = await notes.createdNoteId(
                PARTNER_A,
                'Idées cadeaux',
            );
            const cadeaux = await folders.createdId(
                PARTNER_A,
                'Cadeaux',
                'PRIVATE',
            );
            const moved = await folders.moveNote(
                PARTNER_A,
                noteId,
                'PRIVATE',
                cadeaux,
            );
            expect(moved).toEqual({
                status: 200,
                body: expect.objectContaining({
                    visibility: 'PRIVATE',
                    folderId: cadeaux,
                }),
            });
            const events = await readNoteEvents(notes.prisma, noteId);
            expect(events.map(({ eventName }) => eventName).slice(1)).toEqual([
                NoteMadePrivateEvent.EVENT_NAME,
                NoteMovedEvent.EVENT_NAME,
            ]);
            expect((await notes.get(PARTNER_B, noteId)).status).toBe(404);
            expect(
                contentsOf(
                    await folders.contents(PARTNER_A, 'PRIVATE', cadeaux),
                ).notes.map(({ title }) => title),
            ).toEqual(['Idées cadeaux']);
        });

        it('refuses with 403 the other partner who files it in her own « Privé » (R5)', async () => {
            const noteId = await notes.createdNoteId(PARTNER_A, 'Courses');
            expect(
                await folders.moveNote(PARTNER_B, noteId, 'PRIVATE', null),
            ).toEqual(
                refusal(
                    403,
                    NoteExceptionCodeEnum.NOTE_RESERVED_TO_OWNER,
                    'Reserved to the owner of the note',
                ),
            );
        });
    });

    describe('Scenario: R11, a note created in « Privé »', () => {
        it('answers 201, private from the start', async () => {
            const response = await folders.createNote(
                PARTNER_A,
                'Montre',
                'PRIVATE',
                null,
            );
            expect(response).toEqual({
                status: 201,
                body: expect.objectContaining({
                    visibility: 'PRIVATE',
                    folderId: null,
                }),
            });
        });
    });
});
