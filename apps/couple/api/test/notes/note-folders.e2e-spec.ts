import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { readNoteEvents } from '@cocooning/couple-e2e-shared/fixtures';
import {
    FolderCreatedEvent,
    FolderDeletedEvent,
    FolderMovedEvent,
    FolderRenamedEvent,
} from '@cocooning/couple-server-business-logic/notes';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { contentsOf, folderOf, FolderRequests } from './folder-requests';
import { NotesTestApp } from './notes-test-app';
import {
    COUPLE_ID,
    NOTES_SESSION_MISSING,
    NOW,
    PARTNER_A,
    PARTNER_B,
    refusal,
    STRANGER,
} from './notes-test-data';

const FOLDER_NOT_FOUND = refusal(
    404,
    NoteExceptionCodeEnum.FOLDER_NOT_FOUND,
    'Folder not found',
);
const MOVE_INVALID = refusal(
    422,
    NoteExceptionCodeEnum.FOLDER_MOVE_INVALID,
    'A folder stays in its space, out of its own sub-folders',
);

describe('Feature: the partners manage the folders of their notes (R13 to R16)', () => {
    const notes = new NotesTestApp();
    const folders = new FolderRequests((userId) => notes.as(userId));

    beforeAll(() => notes.start());
    afterAll(() => notes.stop());
    beforeEach(() => notes.reset());

    describe('Scenario: R13, a partner creates a folder at the root of « Partagé »', () => {
        it('answers 201 with the folder and writes its outbox row, without the name', async () => {
            const response = await folders.create(PARTNER_A, ' Restaurants ');
            const { folderId } = folderOf(response);
            expect(response).toEqual({
                status: 201,
                body: {
                    folderId,
                    space: 'SHARED',
                    kind: 'CLASSIC',
                    parentFolderId: null,
                    name: 'Restaurants',
                    subject: null,
                    cardTemplate: null,
                    updatedAt: NOW.toISOString(),
                },
            });
            expect(await readNoteEvents(notes.prisma, folderId)).toEqual([
                {
                    eventName: FolderCreatedEvent.EVENT_NAME,
                    coupleId: COUPLE_ID,
                    aggregateId: folderId,
                    userId: PARTNER_A,
                    version: 1,
                    published: false,
                    eventData: {
                        ownerId: PARTNER_A,
                        space: 'SHARED',
                        kind: 'CLASSIC',
                        parentFolderId: null,
                    },
                },
            ]);
        });

        it('refuses an empty or too long name with 422', async () => {
            expect((await folders.create(PARTNER_A, ' ')).status).toBe(422);
            expect(
                (await folders.create(PARTNER_A, 'a'.repeat(61))).status,
            ).toBe(422);
        });
    });

    describe('Scenario: R14, R15, the other partner renames and moves a shared folder', () => {
        it('answers 200 each time, with one outbox row each', async () => {
            const sorties = await folders.createdId(PARTNER_A, 'Sorties');
            const restaurants = await folders.createdId(
                PARTNER_A,
                'Restaurants',
            );
            notes.advanceMinutes(1);
            const renamed = await folders.rename(
                PARTNER_B,
                restaurants,
                'Tables',
            );
            expect(renamed).toEqual({
                status: 200,
                body: expect.objectContaining({
                    name: 'Tables',
                    updatedAt: new Date(NOW.getTime() + 60_000).toISOString(),
                }),
            });
            const moved = await folders.move(PARTNER_B, restaurants, sorties);
            expect(moved).toEqual({
                status: 200,
                body: expect.objectContaining({ parentFolderId: sorties }),
            });
            const events = await readNoteEvents(notes.prisma, restaurants);
            expect(events.map(({ eventName }) => eventName)).toEqual([
                FolderCreatedEvent.EVENT_NAME,
                FolderRenamedEvent.EVENT_NAME,
                FolderMovedEvent.EVENT_NAME,
            ]);
        });

        it('refuses with 422 a move into itself, a sub-folder or the other space', async () => {
            const sorties = await folders.createdId(PARTNER_A, 'Sorties');
            const restaurants = await folders.createdId(
                PARTNER_A,
                'Restaurants',
                'SHARED',
                sorties,
            );
            const cadeaux = await folders.createdId(
                PARTNER_A,
                'Cadeaux',
                'PRIVATE',
            );
            expect(await folders.move(PARTNER_A, sorties, sorties)).toEqual(
                MOVE_INVALID,
            );
            expect(await folders.move(PARTNER_A, sorties, restaurants)).toEqual(
                MOVE_INVALID,
            );
            expect(await folders.move(PARTNER_A, sorties, cadeaux)).toEqual(
                MOVE_INVALID,
            );
        });
    });

    describe('Scenario: R16, a partner deletes a folder', () => {
        it('answers 204, and its notes and sub-folders move up to its parent', async () => {
            const sorties = await folders.createdId(PARTNER_A, 'Sorties');
            const restaurants = await folders.createdId(
                PARTNER_A,
                'Restaurants',
                'SHARED',
                sorties,
            );
            await folders.create(PARTNER_A, 'Italiens', 'SHARED', restaurants);
            await folders.createNote(
                PARTNER_A,
                'Chez Luigi',
                'SHARED',
                restaurants,
            );
            expect(await folders.delete(PARTNER_B, restaurants)).toEqual({
                status: 204,
                body: null,
            });
            const contents = contentsOf(
                await folders.contents(PARTNER_A, 'SHARED', sorties),
            );
            expect(contents.folders.map(({ name }) => name)).toEqual([
                'Italiens',
            ]);
            expect(contents.notes.map(({ title }) => title)).toEqual([
                'Chez Luigi',
            ]);
            const events = await readNoteEvents(notes.prisma, restaurants);
            expect(events.at(-1)?.eventName).toBe(
                FolderDeletedEvent.EVENT_NAME,
            );
            expect(
                (await folders.contents(PARTNER_A, 'SHARED', restaurants))
                    .status,
            ).toBe(404);
        });
    });

    describe('Scenario: R14, a folder of the other partner’s « Privé »', () => {
        it('answers 404 to open, rename, move or delete it', async () => {
            const cadeaux = await folders.createdId(
                PARTNER_A,
                'Cadeaux',
                'PRIVATE',
            );
            expect(
                await folders.contents(PARTNER_B, 'PRIVATE', cadeaux),
            ).toEqual(FOLDER_NOT_FOUND);
            expect(await folders.rename(PARTNER_B, cadeaux, 'Volé')).toEqual(
                FOLDER_NOT_FOUND,
            );
            expect(await folders.move(PARTNER_B, cadeaux, null)).toEqual(
                FOLDER_NOT_FOUND,
            );
            expect(await folders.delete(PARTNER_B, cadeaux)).toEqual(
                FOLDER_NOT_FOUND,
            );
        });
    });

    describe('Scenario: another couple (core.md rule 27)', () => {
        it('answers 404 on a shared folder of the couple', async () => {
            const restaurants = await folders.createdId(
                PARTNER_A,
                'Restaurants',
            );
            expect(await folders.rename(STRANGER, restaurants, 'Volé')).toEqual(
                FOLDER_NOT_FOUND,
            );
            expect(await folders.delete(STRANGER, restaurants)).toEqual(
                FOLDER_NOT_FOUND,
            );
        });
    });

    describe('Scenario: a request outside the contract or without session', () => {
        it('refuses a folder identifier that is not a UUID with 422', async () => {
            expect((await folders.delete(PARTNER_A, 'not-a-uuid')).status).toBe(
                422,
            );
        });

        it('refuses with 401 without a session', async () => {
            const response = await notes
                .unauthenticated()
                .post(ApiRouterEnum.FOLDER_CREATE, {
                    space: 'SHARED',
                    parentFolderId: null,
                    name: 'Restaurants',
                });
            expect(response).toEqual(NOTES_SESSION_MISSING);
        });
    });
});
