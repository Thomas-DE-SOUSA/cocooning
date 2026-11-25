import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { readNoteEvents } from '@cocooning/couple-e2e-shared/fixtures';
import { FolderTemplateEditedEvent } from '@cocooning/couple-server-business-logic/notes';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { folderOf, FolderRequests } from './folder-requests';
import { PROPOSED_TEMPLATE } from './fake-note-card-writer';
import { NotesTestApp } from './notes-test-app';
import {
    NOTES_SESSION_MISSING,
    NOW,
    PARTNER_A,
    PARTNER_B,
    refusal,
    STRANGER,
} from './notes-test-data';

const RESTAURANTS = {
    subject: 'Les restaurants que nous voulons essayer',
    cardTemplate: ['Adresse', 'Cuisine', 'Prix'],
};
const EDITED = {
    subject: 'Les restaurants de nos sorties',
    cardTemplate: ['Adresse', 'Prix', 'Horaires'],
};

describe('Feature: the smart folders, their subject and their template (R17, R18)', () => {
    const notes = new NotesTestApp();
    const folders = new FolderRequests((userId) => notes.as(userId));

    beforeAll(() => notes.start());
    afterAll(() => notes.stop());
    beforeEach(() => notes.reset());

    const restaurantsOf = async (userId: string) =>
        folderOf(await folders.createSmart(userId, 'Restaurants', RESTAURANTS))
            .folderId;

    describe('Scenario: R17, the AI proposes, nothing is created', () => {
        it('answers 200 with the proposal, sends the names only', async () => {
            await expect(
                folders.proposeTemplate(PARTNER_A, ' Restaurants '),
            ).resolves.toEqual({
                status: 200,
                body: {
                    subject: PROPOSED_TEMPLATE.subject,
                    cardTemplate: PROPOSED_TEMPLATE.fieldNames,
                },
            });
            expect(notes.writer.templateRequests).toEqual([
                { folderName: 'Restaurants', parentFolderNames: [] },
            ]);
        });

        it('answers 503 when the AI does not answer, without detail', async () => {
            notes.writer.willBeUnavailable();
            await expect(
                folders.proposeTemplate(PARTNER_A, 'Restaurants'),
            ).resolves.toEqual(
                refusal(
                    503,
                    NoteExceptionCodeEnum.NOTE_CARD_WRITER_UNAVAILABLE,
                    'The AI did not answer',
                ),
            );
        });

        it('answers 422 inside a smart folder (R18)', async () => {
            const folderId = await restaurantsOf(PARTNER_A);
            await expect(
                folders.proposeTemplate(PARTNER_B, 'Lyon', folderId),
            ).resolves.toEqual(
                refusal(
                    422,
                    NoteExceptionCodeEnum.FOLDER_TEMPLATE_INHERITED,
                    'A folder inside a smart folder inherits its template',
                ),
            );
        });

        it('answers 401 without a session', async () => {
            await expect(
                notes
                    .unauthenticated()
                    .post(ApiRouterEnum.FOLDER_TEMPLATE_PROPOSE, {}),
            ).resolves.toEqual(NOTES_SESSION_MISSING);
        });
    });

    describe('Scenario: R17, R18, a smart folder and its sub-folder', () => {
        it('stores the settings at the top, the sub-folder inherits', async () => {
            const response = await folders.createSmart(
                PARTNER_A,
                'Restaurants',
                RESTAURANTS,
            );
            const { folderId } = folderOf(response);
            expect(response).toEqual({
                status: 201,
                body: {
                    folderId,
                    space: 'SHARED',
                    kind: 'SMART',
                    parentFolderId: null,
                    name: 'Restaurants',
                    ...RESTAURANTS,
                    updatedAt: NOW.toISOString(),
                },
            });
            const lyon = await folders.create(
                PARTNER_B,
                'Lyon',
                'SHARED',
                folderId,
            );
            expect(folderOf(lyon)).toMatchObject({
                kind: 'SMART',
                subject: null,
                cardTemplate: null,
            });
        });

        it('answers 422 to a smart folder without settings', async () => {
            await expect(
                folders.createSmart(PARTNER_A, 'Restaurants', null),
            ).resolves.toEqual(
                refusal(
                    422,
                    NoteExceptionCodeEnum.CARD_TEMPLATE_INVALID,
                    'A smart folder needs a subject and a card template',
                ),
            );
        });
    });

    describe('Scenario: R17, R18, R14, both partners correct the template from any folder of the tree', () => {
        it('answers 200 with the folder holding it and writes its outbox row', async () => {
            const folderId = await restaurantsOf(PARTNER_A);
            const lyonId = folderOf(
                await folders.create(PARTNER_A, 'Lyon', 'SHARED', folderId),
            ).folderId;
            notes.advanceMinutes(5);
            const response = await folders.editTemplate(
                PARTNER_B,
                lyonId,
                EDITED,
            );
            expect(response).toEqual({
                status: 200,
                body: expect.objectContaining({
                    folderId,
                    ...EDITED,
                    updatedAt: notes.clock.now().toISOString(),
                }),
            });
            const events = await readNoteEvents(notes.prisma, folderId);
            expect(events.at(-1)).toMatchObject({
                eventName: FolderTemplateEditedEvent.EVENT_NAME,
                userId: PARTNER_B,
                eventData: null,
            });
        });

        it('answers 422 on a classic folder and 404 to another couple', async () => {
            const classic = folderOf(
                await folders.create(PARTNER_A, 'Sorties'),
            ).folderId;
            await expect(
                folders.editTemplate(PARTNER_A, classic, EDITED),
            ).resolves.toEqual(
                refusal(
                    422,
                    NoteExceptionCodeEnum.FOLDER_NOT_SMART,
                    'Not in a smart folder',
                ),
            );
            const folderId = await restaurantsOf(PARTNER_A);
            await expect(
                folders.editTemplate(STRANGER, folderId, EDITED),
            ).resolves.toEqual(
                refusal(
                    404,
                    NoteExceptionCodeEnum.FOLDER_NOT_FOUND,
                    'Folder not found',
                ),
            );
        });

        it('answers 422 to a template repeating a field', async () => {
            const folderId = await restaurantsOf(PARTNER_A);
            const response = await folders.editTemplate(PARTNER_A, folderId, {
                subject: 'S',
                cardTemplate: ['Prix', 'prix'],
            });
            expect(response.status).toBe(422);
        });
    });
});
