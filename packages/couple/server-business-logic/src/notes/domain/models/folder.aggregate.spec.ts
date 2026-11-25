import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { createSmartFolderSettings } from './smart-folder-settings';
import { NoteId } from '../value-objects/note-id.vo';
import {
    AS_A,
    NotesTestContext,
    PARTNER_A,
} from '../../__tests__/fixtures/notes-test.context';

describe('Feature: the template held by a folder (R18)', () => {
    let ctx: NotesTestContext;

    beforeEach(() => {
        ctx = new NotesTestContext();
    });
    afterEach(() => NoteId.resetForTests());

    it('refuses to edit the template of a smart sub-folder, which holds none', () => {
        const restaurants = ctx.givenSmartFolderOf(AS_A, 'Restaurants');
        const lyon = ctx.givenSmartFolderOf(AS_A, 'Lyon', restaurants);
        expect(() =>
            lyon.editTemplate(
                PARTNER_A,
                createSmartFolderSettings('Lyon', ['Prix']),
                ctx.dateTimeProvider.now(),
            ),
        ).toThrow(
            expect.objectContaining({
                code: NoteExceptionCodeEnum.FOLDER_NOT_SMART,
            }),
        );
        expect(lyon.getDomainEvents()).toEqual([]);
    });
});
