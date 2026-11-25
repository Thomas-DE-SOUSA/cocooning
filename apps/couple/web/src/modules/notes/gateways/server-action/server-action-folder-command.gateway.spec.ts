import { ApiErrorCodeEnum } from '@cocooning/couple-client-business-logic/shared';
import { A_PROPOSED_TEMPLATE } from '@cocooning/couple-client-business-logic/testing';
import { NoteSpaceEnum } from '@cocooning/couple-shared-kernel/enums';
import { ok } from '@cocooning/shared-kernel/utils';
import { ServerActionFolderCommandGateway } from './server-action-folder-command.gateway';

const FOLDER_ID = '01936b2e-7c4a-7000-8000-0000000000e1';
const SHARED_ROOT = { space: NoteSpaceEnum.SHARED, folderId: null };
const TEMPLATE = { subject: 'Nos restos', fields: ['Adresse'] };
const rejects = () => Promise.reject(new TypeError('Failed to fetch'));

const REJECTING = new ServerActionFolderCommandGateway({
    createFolder: rejects,
    proposeFolderTemplate: rejects,
    editFolderTemplate: rejects,
    renameFolder: rejects,
    deleteFolder: rejects,
    moveFolder: rejects,
});

describe('Feature: folder commands through the server actions', () => {
    it('gives the result of each action with its input', async () => {
        const sent: unknown[] = [];
        const record = (...input: unknown[]) => {
            sent.push(input);
            return Promise.resolve(ok(null));
        };
        const gateway = new ServerActionFolderCommandGateway({
            createFolder: record,
            proposeFolderTemplate: (...input: unknown[]) => {
                sent.push(input);
                return Promise.resolve(ok(A_PROPOSED_TEMPLATE));
            },
            editFolderTemplate: record,
            renameFolder: record,
            deleteFolder: record,
            moveFolder: record,
        });

        await expect(
            gateway.createFolder({ name: 'Maison' }, SHARED_ROOT),
        ).resolves.toEqual(ok(null));
        await expect(
            gateway.proposeFolderTemplate({ name: 'Restos' }, SHARED_ROOT),
        ).resolves.toEqual(ok(A_PROPOSED_TEMPLATE));
        await gateway.editFolderTemplate(FOLDER_ID, TEMPLATE);
        await gateway.renameFolder(FOLDER_ID, { name: 'Travaux' });
        await gateway.deleteFolder(FOLDER_ID);
        await gateway.moveFolder(FOLDER_ID, null);

        expect(sent).toEqual([
            [{ name: 'Maison' }, SHARED_ROOT],
            [{ name: 'Restos' }, SHARED_ROOT],
            [FOLDER_ID, TEMPLATE],
            [FOLDER_ID, { name: 'Travaux' }],
            [FOLDER_ID],
            [FOLDER_ID, null],
        ]);
    });

    it.each([
        [
            'createFolder',
            () => REJECTING.createFolder({ name: 'M' }, SHARED_ROOT),
        ],
        [
            'proposeFolderTemplate',
            () => REJECTING.proposeFolderTemplate({ name: 'M' }, SHARED_ROOT),
        ],
        [
            'editFolderTemplate',
            () => REJECTING.editFolderTemplate(FOLDER_ID, TEMPLATE),
        ],
        [
            'renameFolder',
            () => REJECTING.renameFolder(FOLDER_ID, { name: 'M' }),
        ],
        ['deleteFolder', () => REJECTING.deleteFolder(FOLDER_ID)],
        ['moveFolder', () => REJECTING.moveFolder(FOLDER_ID, null)],
    ])(
        'gives a network error instead of rejecting for %s',
        async (_label, send) => {
            const result = await send();
            expect(result.success === false && result.error.code).toBe(
                ApiErrorCodeEnum.NETWORK_ERROR,
            );
        },
    );
});
