import { ApiErrorCodeEnum } from '@cocooning/couple-client-business-logic/shared';
import { A_SPACE_CONTENTS } from '@cocooning/couple-client-business-logic/testing';
import { NoteSpaceEnum } from '@cocooning/couple-shared-kernel/enums';
import { ok } from '@cocooning/shared-kernel/utils';
import type { NoteLocation } from '../../view-models/note-place.view-model';
import { ServerActionNoteSpaceContentsGateway } from './server-action-note-space-contents.gateway';

const SHARED_ROOT = { space: NoteSpaceEnum.SHARED, folderId: null };

describe('Feature: a place read through a server action', () => {
    it('gives the contents the action read for the place', async () => {
        const asked: NoteLocation[] = [];
        const gateway = new ServerActionNoteSpaceContentsGateway((location) => {
            asked.push(location);
            return Promise.resolve(ok(A_SPACE_CONTENTS));
        });

        await expect(gateway.getSpaceContents(SHARED_ROOT)).resolves.toEqual(
            ok(A_SPACE_CONTENTS),
        );
        expect(asked).toEqual([SHARED_ROOT]);
    });

    it('gives a network error instead of rejecting', async () => {
        const gateway = new ServerActionNoteSpaceContentsGateway(() =>
            Promise.reject(new TypeError('Failed to fetch')),
        );

        const result = await gateway.getSpaceContents(SHARED_ROOT);
        expect(result.success === false && result.error.code).toBe(
            ApiErrorCodeEnum.NETWORK_ERROR,
        );
    });
});
