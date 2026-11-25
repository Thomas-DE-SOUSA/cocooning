import { NoteSpaceEnum } from '@cocooning/couple-shared-kernel/enums';
import { fail, ok } from '@cocooning/shared-kernel/utils';
import { ApiErrorCodeEnum } from '../../../shared/api-error';
import { FakeNoteFoldersGateway } from '../../../testing/fake-note-folders.gateway';
import {
    A_PROPOSED_TEMPLATE,
    A_SMART_FOLDER,
} from '../../../testing/note-folders-fixtures';
import { CreateFolderUseCase } from './create-folder.use-case';
import { EditFolderTemplateUseCase } from './edit-folder-template.use-case';
import { ProposeFolderTemplateUseCase } from './propose-folder-template.use-case';

const DESTINATION = { space: NoteSpaceEnum.SHARED, parentFolderId: null };
const SUBJECT = 'Les restaurants à essayer';
const FIELDS = ['Adresse', 'Prix'];

describe('Feature: the smart folders of the notes from the PWA (R17, R18)', () => {
    let gateway: FakeNoteFoldersGateway;

    beforeEach(() => {
        gateway = new FakeNoteFoldersGateway();
    });

    it('asks the AI for a subject and fields from the name and the place (R17)', async () => {
        await expect(
            new ProposeFolderTemplateUseCase(gateway).execute(
                { name: 'Restaurants' },
                DESTINATION,
            ),
        ).resolves.toEqual(ok(A_PROPOSED_TEMPLATE));
        expect(gateway.calls).toEqual([
            {
                operation: 'proposeFolderTemplate',
                request: { ...DESTINATION, name: 'Restaurants' },
            },
        ]);
    });

    it('creates a smart folder with the corrected subject and fields (R17)', async () => {
        await new CreateFolderUseCase(gateway).execute(
            { name: 'Restaurants', subject: SUBJECT, fields: FIELDS },
            DESTINATION,
        );
        expect(gateway.calls).toEqual([
            {
                operation: 'createFolder',
                request: {
                    ...DESTINATION,
                    name: 'Restaurants',
                    kind: 'SMART',
                    subject: SUBJECT,
                    cardTemplate: FIELDS,
                },
            },
        ]);
    });

    it('corrects the subject and the fields of a smart tree (R18, R22)', async () => {
        const folderId = A_SMART_FOLDER.folderId;
        await expect(
            new EditFolderTemplateUseCase(gateway).execute(folderId, {
                subject: SUBJECT,
                fields: FIELDS,
            }),
        ).resolves.toEqual(
            ok({ ...A_SMART_FOLDER, subject: SUBJECT, cardTemplate: FIELDS }),
        );
        expect(gateway.calls).toEqual([
            {
                operation: 'editFolderTemplate',
                folderId,
                request: { subject: SUBJECT, cardTemplate: FIELDS },
            },
        ]);
    });

    it('returns the refusal of the API unchanged', async () => {
        const unavailable = {
            code: ApiErrorCodeEnum.UNKNOWN,
            message: 'Writer unavailable',
            backendCode: 'NOTE_CARD_WRITER_UNAVAILABLE',
        };
        gateway.givenRefusal(unavailable);
        await expect(
            new ProposeFolderTemplateUseCase(gateway).execute(
                { name: 'Restaurants' },
                DESTINATION,
            ),
        ).resolves.toEqual(fail(unavailable));
    });
});
