import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import {
    A_SHARED_FOLDER,
    A_SPACE_CONTENTS,
} from '@cocooning/couple-client-business-logic/testing';
import { NoteSpaceEnum } from '@cocooning/couple-shared-kernel/enums';
import { fail } from '@cocooning/shared-kernel/utils';
import { act, renderHook } from '@testing-library/react';
import { FakeNoteSpaceContentsGateway } from '../gateways/fake/fake-note-space-contents.gateway';
import type { NotePlaceLevel } from '../view-models/note-space-screen.view-model';
import { useMovePicker } from './use-move-picker';

const START: NotePlaceLevel = {
    place: {
        space: NoteSpaceEnum.SHARED,
        folder: null,
        href: '/spaces/SHARED',
    },
    back: null,
    folders: [],
};
const VACANCES = { folderId: A_SHARED_FOLDER.folderId, name: 'Vacances' };

function renderPicker(gateway: FakeNoteSpaceContentsGateway) {
    const failures: ApiError[] = [];
    const { result } = renderHook(() =>
        useMovePicker({
            gateway,
            start: START,
            onFailed: (error) => failures.push(error),
        }),
    );
    return { result, failures };
}

describe('Feature: walking the places of the move picker (R10)', () => {
    it('starts at the level the page read, without reading it again', () => {
        const gateway = new FakeNoteSpaceContentsGateway();
        const { result } = renderPicker(gateway);

        expect(result.current.level).toBe(START);
        expect(gateway.locations).toEqual([]);
    });

    it('reads the place opened and shows its folders and its way back', async () => {
        const gateway = new FakeNoteSpaceContentsGateway();
        gateway.givenContents({ ...A_SPACE_CONTENTS, path: [VACANCES] });
        const { result } = renderPicker(gateway);
        const location = {
            space: NoteSpaceEnum.SHARED,
            folderId: VACANCES.folderId,
        };

        await act(async () => result.current.show(location));

        expect(gateway.locations).toEqual([location]);
        expect(result.current.level).toMatchObject({
            place: { folder: VACANCES },
            back: { folder: null, href: '/spaces/SHARED' },
            folders: [expect.objectContaining({ name: 'Vacances' })],
        });
    });

    it('keeps the level shown when the reading is refused', async () => {
        const refusal: ApiError = {
            code: ApiErrorCodeEnum.NETWORK_ERROR,
            message: 'Unreachable',
            backendCode: null,
        };
        const gateway = new FakeNoteSpaceContentsGateway();
        gateway.givenOutcome(fail(refusal));
        const { result, failures } = renderPicker(gateway);

        await act(async () =>
            result.current.show({
                space: NoteSpaceEnum.PRIVATE,
                folderId: null,
            }),
        );

        expect(result.current.level).toBe(START);
        expect(failures).toEqual([refusal]);
    });
});
