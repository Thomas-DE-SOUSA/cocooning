import { WebRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { isActiveTab } from './active-tab';

const NOTES_ROUTES = [
    WebRouterEnum.HOME,
    WebRouterEnum.NOTE_SPACE,
    WebRouterEnum.NOTE_EDITOR,
];

describe('Feature: the active tab (decisions 0044, 0053)', () => {
    it.each([
        ['the home of the notes', '/'],
        ['a space', '/spaces/SHARED'],
        ['the other space, a folder being in its query', '/spaces/PRIVATE'],
        ['the page of a note', '/notes/01936b2e-7c4a-7000-8000-0000000000d1'],
    ])('keeps "Notes" active on %s', (_label, pathname) => {
        expect(isActiveTab(pathname, NOTES_ROUTES)).toBe(true);
    });

    it.each([
        ['the agenda', '/agenda'],
        ['the "Nous" tab', '/couple'],
    ])('leaves "Notes" inactive on %s', (_label, pathname) => {
        expect(isActiveTab(pathname, NOTES_ROUTES)).toBe(false);
    });

    it('matches a route without a parameter exactly', () => {
        expect(isActiveTab('/agenda', [WebRouterEnum.AGENDA])).toBe(true);
        expect(isActiveTab('/agenda/old', [WebRouterEnum.AGENDA])).toBe(false);
    });
});
