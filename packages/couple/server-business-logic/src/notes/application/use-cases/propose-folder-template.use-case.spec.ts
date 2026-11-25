import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import {
    type NoteSpace,
    NoteSpaceEnum,
} from '@cocooning/couple-shared-kernel/enums';
import { NoteId } from '../../domain/value-objects/note-id.vo';
import {
    AS_A,
    AS_B,
    AS_STRANGER,
    NotesTestContext,
} from '../../__tests__/fixtures/notes-test.context';
import { PROPOSED_TEMPLATE } from '../../__tests__/secondary/adapters/fake-note-card.writer';

describe('Feature: the AI proposes the subject and the template of a smart folder (R17)', () => {
    let ctx: NotesTestContext;

    beforeEach(() => {
        ctx = new NotesTestContext();
    });
    afterEach(() => NoteId.resetForTests());

    const propose = (
        context: typeof AS_A,
        name: string,
        parentFolderId: string | null = null,
        space: NoteSpace = NoteSpaceEnum.SHARED,
    ) =>
        ctx
            .proposeFolderTemplateUseCase()
            .execute(context, { space, parentFolderId, name });

    describe('Scenario: R17, R24, a partner names a new folder at the root', () => {
        it('returns the proposal, sends only the names, and stores nothing', async () => {
            await expect(propose(AS_A, ' Restaurants ')).resolves.toEqual({
                subject: PROPOSED_TEMPLATE.subject,
                cardTemplate: PROPOSED_TEMPLATE.fieldNames,
            });
            expect(ctx.noteCardWriter.templateRequests).toEqual([
                { folderName: 'Restaurants', parentFolderNames: [] },
            ]);
            expect(ctx.folderRepository.storedSnapshots).toEqual([]);
            expect(ctx.eventPublisher.published).toEqual([]);
        });
    });

    describe('Scenario: R24, inside classic folders', () => {
        it('sends the names of the folders above', async () => {
            const sorties = ctx.givenFolderOf(AS_A, 'Sorties');
            const lyon = ctx.givenFolderOf(AS_A, 'Lyon', sorties);
            await propose(AS_B, 'Restaurants', lyon.id.getValue());
            expect(ctx.noteCardWriter.templateRequests).toEqual([
                {
                    folderName: 'Restaurants',
                    parentFolderNames: ['Sorties', 'Lyon'],
                },
            ]);
        });
    });

    describe('Scenario: R18, inside a smart folder', () => {
        it('refuses: the new folder inherits, nothing leaves for the AI', async () => {
            const restaurants = ctx.givenSmartFolderOf(AS_A, 'Restaurants');
            await expect(
                propose(AS_A, 'Lyon', restaurants.id.getValue()),
            ).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.FOLDER_TEMPLATE_INHERITED,
            });
            expect(ctx.noteCardWriter.templateRequests).toEqual([]);
        });
    });

    describe('Scenario: R14, under a folder the partner does not see', () => {
        it.each([
            ['the other partner', AS_B],
            ['another couple', AS_STRANGER],
        ])('answers not found to %s', async (_label, context) => {
            const cadeaux = ctx.givenPrivateFolderOf(AS_A, 'Cadeaux');
            await expect(
                propose(
                    context,
                    'Noël',
                    cadeaux.id.getValue(),
                    NoteSpaceEnum.PRIVATE,
                ),
            ).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.FOLDER_NOT_FOUND,
            });
        });
    });

    describe('Scenario: the AI cannot answer, or answers outside the rules', () => {
        it('lets the unavailable AI through', async () => {
            ctx.noteCardWriter.willBeUnavailable();
            await expect(propose(AS_A, 'Restaurants')).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.NOTE_CARD_WRITER_UNAVAILABLE,
            });
        });

        it('refuses a proposal that breaks R17', async () => {
            ctx.noteCardWriter.willPropose({
                subject: 'Restaurants',
                fieldNames: ['Prix', 'prix'],
            });
            await expect(propose(AS_A, 'Restaurants')).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.CARD_TEMPLATE_INVALID,
            });
        });

        it('refuses an invalid name before asking', async () => {
            await expect(propose(AS_A, ' ')).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.FOLDER_NAME_INVALID,
            });
            expect(ctx.noteCardWriter.templateRequests).toEqual([]);
        });
    });
});
