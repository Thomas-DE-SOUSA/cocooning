import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { readNoteEvents } from '@cocooning/couple-e2e-shared/fixtures';
import {
    NoteCardRequestedEvent,
    NoteCreatedEvent,
} from '@cocooning/couple-server-business-logic/notes';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { CardRequests, cardOf, noteDetailOf } from './card-requests';
import { contentsOf, folderOf, FolderRequests } from './folder-requests';
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
const EMPTY_FIELDS = RESTAURANTS.cardTemplate.map((name) => ({
    name,
    value: null,
    isManual: false,
}));
const CANDIDATES = [
    { label: 'Chez Paul', detail: 'Lyon 2e' },
    { label: 'Chez Paul', detail: 'Paris 11e' },
];

describe('Feature: the cards of the notes of a smart folder (R19 to R22)', () => {
    const notes = new NotesTestApp();
    const folders = new FolderRequests((userId) => notes.as(userId));
    const cards = new CardRequests((userId) => notes.as(userId));

    beforeAll(() => notes.start());
    afterAll(() => notes.stop());
    beforeEach(() => notes.reset());

    const smartFolder = async () =>
        folderOf(
            await folders.createSmart(PARTNER_A, 'Restaurants', RESTAURANTS),
        ).folderId;
    const addedNote = async (folderId: string) =>
        noteDetailOf(await cards.add(PARTNER_B, folderId, 'Chez Paul'));
    const setCard = (noteId: string, data: Record<string, unknown>) =>
        notes.prisma.includingDeleted.noteCard.updateMany({
            where: { noteId },
            data,
        });

    describe('Scenario: R19, R20, the other partner adds « Chez Paul »', () => {
        it('answers 201 with the note and its card « en recherche », and writes both outbox rows', async () => {
            const folderId = await smartFolder();
            const response = await cards.add(
                PARTNER_B,
                folderId,
                ' Chez Paul ',
            );
            const { noteId, card } = noteDetailOf(response);
            expect(response).toEqual({
                status: 201,
                body: {
                    noteId,
                    ownerId: PARTNER_B,
                    isOwner: true,
                    title: 'Chez Paul',
                    visibility: 'SHARED',
                    folderId,
                    updatedAt: NOW.toISOString(),
                    card: {
                        noteCardId: card?.noteCardId,
                        noteId,
                        status: 'PENDING',
                        query: 'Chez Paul',
                        fields: EMPTY_FIELDS,
                        candidates: [],
                        sources: [],
                        searchedAt: null,
                        updatedAt: NOW.toISOString(),
                    },
                    listKind: null,
                    emoji: null,
                },
            });
            expect(
                (await readNoteEvents(notes.prisma, noteId)).map(
                    (e) => e.eventName,
                ),
            ).toEqual([NoteCreatedEvent.EVENT_NAME]);
            expect(
                await readNoteEvents(notes.prisma, card?.noteCardId ?? ''),
            ).toEqual([
                expect.objectContaining({
                    eventName: NoteCardRequestedEvent.EVENT_NAME,
                    userId: PARTNER_B,
                    eventData: { noteId, status: 'PENDING' },
                }),
            ]);
        });

        it('answers the card with the note and in the content of the folder', async () => {
            const folderId = await smartFolder();
            const { noteId } = await addedNote(folderId);
            expect(
                noteDetailOf(await notes.get(PARTNER_A, noteId)).card,
            ).toMatchObject({
                status: 'PENDING',
            });
            const contents = contentsOf(
                await folders.contents(PARTNER_A, 'SHARED', folderId),
            );
            expect(contents.cardContext).toEqual({ folderId, ...RESTAURANTS });
            expect(contents.notes[0]?.card?.status).toBe('PENDING');
        });

        it('answers 422 in a classic folder, 404 to another couple, 401 without a session', async () => {
            const classic = folderOf(
                await folders.create(PARTNER_A, 'Sorties'),
            ).folderId;
            await expect(
                cards.add(PARTNER_A, classic, 'Chez Paul'),
            ).resolves.toEqual(
                refusal(
                    422,
                    NoteExceptionCodeEnum.FOLDER_NOT_SMART,
                    'Not in a smart folder',
                ),
            );
            const folderId = await smartFolder();
            await expect(
                cards.add(STRANGER, folderId, 'Chez Paul'),
            ).resolves.toEqual(
                refusal(
                    404,
                    NoteExceptionCodeEnum.FOLDER_NOT_FOUND,
                    'Folder not found',
                ),
            );
            await expect(
                notes
                    .unauthenticated()
                    .post(
                        ApiRouterEnum.NOTE_CARD_ADD.replace(
                            ':folderId',
                            folderId,
                        ),
                        {
                            name: 'Chez Paul',
                        },
                    ),
            ).resolves.toEqual(NOTES_SESSION_MISSING);
        });
    });

    describe('Scenario: R19, a candidate is chosen, or the name refined', () => {
        it('answers 200 with the card searching again', async () => {
            const { noteId } = await addedNote(await smartFolder());
            await setCard(noteId, {
                status: 'CHOOSING',
                candidates: CANDIDATES,
            });
            const chosen = await cards.choose(PARTNER_A, noteId, 0);
            expect(chosen.status).toBe(200);
            expect(cardOf(chosen)).toMatchObject({
                status: 'PENDING',
                query: 'Chez Paul, Lyon 2e',
                candidates: [],
            });
            await setCard(noteId, { status: 'FAILED' });
            expect(
                cardOf(await cards.refine(PARTNER_B, noteId, 'Chez Paul Lyon')),
            ).toMatchObject({
                status: 'PENDING',
                query: 'Chez Paul Lyon',
            });
        });

        it('answers 409 while the search is in progress, 422 for a missing candidate', async () => {
            const { noteId } = await addedNote(await smartFolder());
            expect((await cards.refine(PARTNER_A, noteId, 'Lyon')).status).toBe(
                409,
            );
            await setCard(noteId, {
                status: 'CHOOSING',
                candidates: CANDIDATES,
            });
            expect(
                (await cards.choose(PARTNER_A, noteId, 2)).body,
            ).toMatchObject({
                code: NoteExceptionCodeEnum.NOTE_CARD_CANDIDATE_INVALID,
            });
        });
    });

    describe('Scenario: R22, a field is corrected, then « Mettre à jour »', () => {
        it('keeps the correction through the refresh', async () => {
            const { noteId } = await addedNote(await smartFolder());
            await setCard(noteId, { status: 'FILLED' });
            const corrected = await cards.correct(
                PARTNER_A,
                noteId,
                'Prix',
                '25 €',
            );
            expect(cardOf(corrected).fields[2]).toEqual({
                name: 'Prix',
                value: '25 €',
                isManual: true,
            });
            const refreshed = cardOf(await cards.refresh(PARTNER_B, noteId));
            expect(refreshed).toMatchObject({ status: 'PENDING' });
            expect(refreshed.fields[2]).toEqual({
                name: 'Prix',
                value: '25 €',
                isManual: true,
            });
        });

        it('answers 404 to another couple and NOTE_CARD_NOT_FOUND for a note without card', async () => {
            const { noteId } = await addedNote(await smartFolder());
            expect((await cards.refresh(STRANGER, noteId)).status).toBe(404);
            const plain = await notes.createdNoteId(PARTNER_A, 'Courses');
            await expect(cards.refresh(PARTNER_A, plain)).resolves.toEqual(
                refusal(
                    404,
                    NoteExceptionCodeEnum.NOTE_CARD_NOT_FOUND,
                    'This note has no card',
                ),
            );
        });
    });

    describe('Scenario: R22, a field is added to the template', () => {
        it('searches the filled cards of the folder again', async () => {
            const folderId = await smartFolder();
            const { noteId } = await addedNote(folderId);
            await setCard(noteId, { status: 'FILLED' });
            await folders.editTemplate(PARTNER_A, folderId, {
                subject: RESTAURANTS.subject,
                cardTemplate: [...RESTAURANTS.cardTemplate, 'Horaires'],
            });
            const { card } = noteDetailOf(await notes.get(PARTNER_A, noteId));
            expect(card?.status).toBe('PENDING');
            expect(card?.fields.map(({ name }) => name)).toEqual([
                ...RESTAURANTS.cardTemplate,
                'Horaires',
            ]);
        });
    });

    describe('Scenario: R25, the note moves to another smart folder', () => {
        it('gives its card the new template, keeping the fields of the same name', async () => {
            const { noteId } = await addedNote(await smartFolder());
            await setCard(noteId, {
                status: 'FILLED',
                fields: [
                    {
                        name: 'Adresse',
                        value: '11 rue Mercière',
                        isManual: false,
                    },
                    { name: 'Cuisine', value: 'Lyonnaise', isManual: false },
                    { name: 'Prix', value: '25 €', isManual: true },
                ],
            });
            const sorties = folderOf(
                await folders.createSmart(PARTNER_A, 'Sorties', {
                    subject: 'Nos sorties',
                    cardTemplate: ['Prix', 'Ambiance'],
                }),
            ).folderId;
            expect(
                (await folders.moveNote(PARTNER_B, noteId, 'SHARED', sorties))
                    .status,
            ).toBe(200);
            const { card } = noteDetailOf(await notes.get(PARTNER_A, noteId));
            expect(card).toMatchObject({
                status: 'FILLED',
                fields: [
                    { name: 'Prix', value: '25 €', isManual: true },
                    { name: 'Ambiance', value: null, isManual: false },
                ],
            });
            expect(
                (await folders.moveNote(PARTNER_B, noteId, 'SHARED', null))
                    .status,
            ).toBe(200);
            expect(
                noteDetailOf(await notes.get(PARTNER_A, noteId)).card?.fields,
            ).toEqual(card?.fields);
        });
    });
});
