import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import {
    type FolderKind,
    FolderKindEnum,
    NoteSpaceEnum,
} from '@cocooning/couple-shared-kernel/enums';
import { FolderCreatedEvent } from '../../domain/events/folder-created.event';
import { NoteId } from '../../domain/value-objects/note-id.vo';
import {
    AS_A,
    AS_B,
    COUPLE_ID,
    NOW,
    NotesTestContext,
    PARTNER_A,
    PARTNER_B,
} from '../../__tests__/fixtures/notes-test.context';

const FIRST_ID = '00000000-0000-7000-8000-000000000001';
const SUBJECT = 'Les restaurants que nous voulons essayer';
const TEMPLATE = ['Adresse', 'Cuisine', 'Prix'];

type SmartRequest = {
    readonly kind: FolderKind;
    readonly subject: string | null;
    readonly cardTemplate: ReadonlyArray<string> | null;
};

const SMART: SmartRequest = {
    kind: FolderKindEnum.SMART,
    subject: SUBJECT,
    cardTemplate: TEMPLATE,
};

describe('Feature: create a smart folder (R17, R18)', () => {
    let ctx: NotesTestContext;

    beforeEach(() => {
        ctx = new NotesTestContext();
    });
    afterEach(() => NoteId.resetForTests());

    const create = (
        context: typeof AS_A,
        name: string,
        request: SmartRequest,
        parentFolderId: string | null = null,
    ) =>
        ctx.createFolderUseCase().execute(context, {
            space: NoteSpaceEnum.SHARED,
            parentFolderId,
            name,
            ...request,
        });

    describe('Scenario: R17, a partner creates a smart folder with its subject and template', () => {
        it('returns and stores them, the event telling the kind only', async () => {
            const view = await create(AS_A, 'Restaurants', {
                ...SMART,
                subject: ` ${SUBJECT} `,
            });
            expect(view).toEqual({
                folderId: FIRST_ID,
                space: NoteSpaceEnum.SHARED,
                kind: FolderKindEnum.SMART,
                parentFolderId: null,
                name: 'Restaurants',
                subject: SUBJECT,
                cardTemplate: TEMPLATE,
                updatedAt: NOW,
            });
            expect(ctx.folderRepository.storedSnapshots).toEqual([
                expect.objectContaining({
                    coupleId: COUPLE_ID,
                    ownerId: PARTNER_A,
                    kind: FolderKindEnum.SMART,
                    subject: SUBJECT,
                    cardTemplate: TEMPLATE,
                }),
            ]);
            expect(ctx.eventPublisher.published).toEqual([
                expect.objectContaining({
                    eventName: FolderCreatedEvent.EVENT_NAME,
                    data: {
                        ownerId: PARTNER_A,
                        space: NoteSpaceEnum.SHARED,
                        kind: FolderKindEnum.SMART,
                        parentFolderId: null,
                    },
                }),
            ]);
            const published = JSON.stringify(ctx.eventPublisher.published);
            expect(published).not.toContain(SUBJECT);
            expect(published).not.toContain('Cuisine');
        });
    });

    describe('Scenario: R18, the other partner creates « Lyon » in « Restaurants »', () => {
        it('makes it smart without a template of its own, even when asked classic', async () => {
            const restaurants = ctx.givenSmartFolderOf(AS_A, 'Restaurants');
            const view = await create(
                AS_B,
                'Lyon',
                {
                    kind: FolderKindEnum.CLASSIC,
                    subject: null,
                    cardTemplate: null,
                },
                restaurants.id.getValue(),
            );
            expect(view).toMatchObject({
                kind: FolderKindEnum.SMART,
                subject: null,
                cardTemplate: null,
            });
            expect(ctx.eventPublisher.published[0]?.data).toMatchObject({
                ownerId: PARTNER_B,
                kind: FolderKindEnum.SMART,
            });
        });

        it('refuses a template of its own', async () => {
            const restaurants = ctx.givenSmartFolderOf(AS_A, 'Restaurants');
            await expect(
                create(AS_A, 'Lyon', SMART, restaurants.id.getValue()),
            ).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.FOLDER_TEMPLATE_INHERITED,
            });
            expect(ctx.folderRepository.storedSnapshots).toHaveLength(1);
        });
    });

    describe('Scenario: R17, a smart folder in a classic folder', () => {
        it('holds its own template', async () => {
            const sorties = ctx.givenFolderOf(AS_A, 'Sorties');
            const view = await create(
                AS_A,
                'Restaurants',
                SMART,
                sorties.id.getValue(),
            );
            expect(view.cardTemplate).toEqual(TEMPLATE);
        });
    });

    describe('Scenario: R17, settings that do not match the kind', () => {
        it.each([
            [
                'a smart folder without settings',
                {
                    kind: FolderKindEnum.SMART,
                    subject: null,
                    cardTemplate: null,
                },
                NoteExceptionCodeEnum.CARD_TEMPLATE_INVALID,
            ],
            [
                'a classic folder with settings',
                { ...SMART, kind: FolderKindEnum.CLASSIC },
                NoteExceptionCodeEnum.FOLDER_NOT_SMART,
            ],
            [
                'a subject without a template',
                { ...SMART, cardTemplate: null },
                NoteExceptionCodeEnum.CARD_TEMPLATE_INVALID,
            ],
            [
                'a template without a subject',
                { ...SMART, subject: null },
                NoteExceptionCodeEnum.FOLDER_SUBJECT_INVALID,
            ],
            [
                'a template repeating a field',
                { ...SMART, cardTemplate: ['Prix', 'PRIX'] },
                NoteExceptionCodeEnum.CARD_TEMPLATE_INVALID,
            ],
        ])('refuses %s and stores nothing', async (_label, request, code) => {
            await expect(
                create(AS_A, 'Restaurants', request),
            ).rejects.toMatchObject({ code });
            expect(ctx.folderRepository.storedSnapshots).toEqual([]);
            expect(ctx.eventPublisher.published).toEqual([]);
        });
    });
});
