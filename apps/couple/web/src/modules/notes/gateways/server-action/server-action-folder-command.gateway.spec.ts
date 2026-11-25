import { ApiErrorCodeEnum } from '@cocooning/couple-client-business-logic/shared';
import { NoteSpaceEnum } from '@cocooning/couple-shared-kernel/enums';
import { ok } from '@cocooning/shared-kernel/utils';
import { ServerActionFolderCommandGateway } from './server-action-folder-command.gateway';

const FOLDER_ID = '01936b2e-7c4a-7000-8000-0000000000e1';
const SHARED_ROOT = { space: NoteSpaceEnum.SHARED, folderId: null };
const rejects = () => Promise.reject(new TypeError('Failed to fetch'));

const REJECTING = new ServerActionFolderCommandGateway({
    createFolder: rejects,
    renameFolder: rejects,
    deleteFolder: rejects,
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
            renameFolder: record,
            deleteFolder: record,
        });

        await expect(
            gateway.createFolder({ name: 'Maison' }, SHARED_ROOT),
        ).resolves.toEqual(ok(null));
        await gateway.renameFolder(FOLDER_ID, { name: 'Travaux' });
        await gateway.deleteFolder(FOLDER_ID);

        expect(sent).toEqual([
            [{ name: 'Maison' }, SHARED_ROOT],
            [FOLDER_ID, { name: 'Travaux' }],
            [FOLDER_ID],
        ]);
    });

    it.each([
        [
            'createFolder',
            () => REJECTING.createFolder({ name: 'M' }, SHARED_ROOT),
        ],
        [
            'renameFolder',
            () => REJECTING.renameFolder(FOLDER_ID, { name: 'M' }),
        ],
        ['deleteFolder', () => REJECTING.deleteFolder(FOLDER_ID)],
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
