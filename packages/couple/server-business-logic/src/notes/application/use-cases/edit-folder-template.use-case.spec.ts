import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import {
    FolderKindEnum,
    NoteSpaceEnum,
} from '@cocooning/couple-shared-kernel/enums';
import { FolderTemplateEditedEvent } from '../../domain/events/folder-template-edited.event';
import { NoteId } from '../../domain/value-objects/note-id.vo';
import {
    AS_A,
    AS_B,
    AS_STRANGER,
    NOW,
    NotesTestContext,
} from '../../__tests__/fixtures/notes-test.context';

const EDITED_AT = new Date('2026-11-23T11:00:00.000Z');
const SUBJECT = 'Les restaurants de nos sorties';
const TEMPLATE = ['Adresse', 'Prix', 'Horaires'];

describe('Feature: correct the subject and the template of a smart folder (R17, R18)', () => {
    let ctx: NotesTestContext;

    beforeEach(() => {
        ctx = new NotesTestContext();
    });
    afterEach(() => NoteId.resetForTests());

    const edit = (context: typeof AS_A, folderId: string) => {
        ctx.advanceHours(1);
        return ctx.editFolderTemplateUseCase().execute(context, {
            folderId,
            subject: SUBJECT,
            cardTemplate: TEMPLATE,
        });
    };

    describe('Scenario: R17, R14, the other partner corrects a shared smart folder', () => {
        it('returns and stores the new settings and records one event without them', async () => {
            const restaurants = ctx.givenSmartFolderOf(AS_A, 'Restaurants');
            const folderId = restaurants.id.getValue();
            await expect(edit(AS_B, folderId)).resolves.toEqual({
                folderId,
                space: NoteSpaceEnum.SHARED,
                kind: FolderKindEnum.SMART,
                parentFolderId: null,
                name: 'Restaurants',
                subject: SUBJECT,
                cardTemplate: TEMPLATE,
                updatedAt: EDITED_AT,
            });
            expect(ctx.folderRepository.storedSnapshots).toEqual([
                expect.objectContaining({
                    subject: SUBJECT,
                    cardTemplate: TEMPLATE,
                    version: 2,
                    metadata: {
                        createdAt: NOW.toISOString(),
                        updatedAt: EDITED_AT.toISOString(),
                        deletedAt: null,
                    },
                }),
            ]);
            const expected = {
                eventId: '00000000-0000-7000-8000-000000000003',
                eventName: FolderTemplateEditedEvent.EVENT_NAME,
                aggregateId: folderId,
                context: AS_B,
                data: null,
                occurredAt: EDITED_AT,
            };
            expect(ctx.folderRepository.persistedEvents).toEqual([expected]);
            expect(ctx.eventPublisher.published).toEqual([expected]);
        });
    });

    describe('Scenario: R18, from « Lyon » in « Restaurants »', () => {
        it('corrects the template held by « Restaurants »', async () => {
            const restaurants = ctx.givenSmartFolderOf(AS_A, 'Restaurants');
            const lyon = ctx.givenSmartFolderOf(AS_A, 'Lyon', restaurants);
            const view = await edit(AS_A, lyon.id.getValue());
            expect(view).toMatchObject({
                folderId: restaurants.id.getValue(),
                cardTemplate: TEMPLATE,
            });
        });
    });

    describe('Scenario: a folder outside any smart tree', () => {
        it('refuses a classic folder', async () => {
            const sorties = ctx.givenFolderOf(AS_A, 'Sorties');
            await expect(
                edit(AS_A, sorties.id.getValue()),
            ).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.FOLDER_NOT_SMART,
            });
            expect(ctx.eventPublisher.published).toEqual([]);
        });
    });

    describe('Scenario: R14, a folder the partner does not see', () => {
        it.each([
            ['the other partner', AS_B],
            ['another couple', AS_STRANGER],
        ])('answers not found to %s', async (_label, context) => {
            const cadeaux = ctx.givenSmartFolderOf(
                AS_A,
                'Cadeaux',
                null,
                NoteSpaceEnum.PRIVATE,
            );
            await expect(
                edit(context, cadeaux.id.getValue()),
            ).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.FOLDER_NOT_FOUND,
            });
        });
    });

    describe('Scenario: R17, an invalid template', () => {
        it('refuses it before loading anything', async () => {
            const restaurants = ctx.givenSmartFolderOf(AS_A, 'Restaurants');
            await expect(
                ctx.editFolderTemplateUseCase().execute(AS_A, {
                    folderId: restaurants.id.getValue(),
                    subject: SUBJECT,
                    cardTemplate: [],
                }),
            ).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.CARD_TEMPLATE_INVALID,
            });
            expect(ctx.folderRepository.storedSnapshots[0]?.version).toBe(1);
        });
    });
});
