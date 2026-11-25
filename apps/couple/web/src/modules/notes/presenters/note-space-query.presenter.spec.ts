import { NoteSpaceEnum } from '@cocooning/couple-shared-kernel/enums';
import { WebRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { presentNoteSpaceQuery } from './note-space-query.presenter';

const FOLDER_ID = '01936b2e-7c4a-7000-8000-0000000000e1';

describe('Feature: the address of a space of the notes (R10)', () => {
    it('opens the root of a space without a folder', () => {
        expect(presentNoteSpaceQuery('SHARED', {})).toEqual({
            redirectTo: null,
            location: { space: NoteSpaceEnum.SHARED, folderId: null },
        });
    });

    it('opens the folder named by the query', () => {
        expect(
            presentNoteSpaceQuery('PRIVATE', { folderId: FOLDER_ID }),
        ).toEqual({
            redirectTo: null,
            location: { space: NoteSpaceEnum.PRIVATE, folderId: FOLDER_ID },
        });
    });

    it('sends an unknown space back home', () => {
        expect(presentNoteSpaceQuery('shared', {}).redirectTo).toBe(
            WebRouterEnum.HOME,
        );
    });

    it.each([
        ['a folder id that is not one', 'maison'],
        ['two folder ids', [FOLDER_ID, FOLDER_ID]],
    ])('sends %s to the root of the space', (_label, folderId) => {
        expect(presentNoteSpaceQuery('SHARED', { folderId }).redirectTo).toBe(
            '/spaces/SHARED',
        );
    });
});
