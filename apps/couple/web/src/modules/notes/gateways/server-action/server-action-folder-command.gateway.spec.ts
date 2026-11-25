import { ApiErrorCodeEnum } from '@cocooning/couple-client-business-logic/shared';
import { NoteSpaceEnum } from '@cocooning/couple-shared-kernel/enums';
import { ok } from '@cocooning/shared-kernel/utils';
import { ServerActionFolderCommandGateway } from './server-action-folder-command.gateway';

const SHARED_ROOT = { space: NoteSpaceEnum.SHARED, folderId: null };
const rejects = () => Promise.reject(new TypeError('Failed to fetch'));

describe('Feature: folder commands through the server actions', () => {
    it('gives the result of each action with its input', async () => {
        const sent: unknown[] = [];
        const gateway = new ServerActionFolderCommandGateway({
            createFolder: (form, destination) => {
                sent.push([form.name, destination]);
                return Promise.resolve(ok(null));
            },
        });

        await expect(
            gateway.createFolder({ name: 'Maison' }, SHARED_ROOT),
        ).resolves.toEqual(ok(null));
        expect(sent).toEqual([['Maison', SHARED_ROOT]]);
    });

    it('gives a network error instead of rejecting', async () => {
        const gateway = new ServerActionFolderCommandGateway({
            createFolder: rejects,
        });

        const result = await gateway.createFolder(
            { name: 'Maison' },
            SHARED_ROOT,
        );
        expect(result.success === false && result.error.code).toBe(
            ApiErrorCodeEnum.NETWORK_ERROR,
        );
    });
});
