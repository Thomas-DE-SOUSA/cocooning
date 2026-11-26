import { checkLine, uncheckLine } from './checklist-line';

const ME = '01936b2e-7c4a-7000-8000-0000000000a1';
const YOU = '01936b2e-7c4a-7000-8000-0000000000a2';
const BREAD = { id: 'line-1', text: 'Pain', checked: false, checkedBy: null };

describe('Feature: checking a line of a list (R29, R30)', () => {
    it('records who checks the line', () => {
        expect(checkLine(BREAD, ME)).toEqual({
            ...BREAD,
            checked: true,
            checkedBy: ME,
        });
    });

    it('keeps the first checker of a line already checked', () => {
        const checkedByYou = checkLine(BREAD, YOU);
        expect(checkLine(checkedByYou, ME)).toBe(checkedByYou);
    });

    it('forgets who checked a line once unchecked', () => {
        expect(uncheckLine(checkLine(BREAD, YOU))).toEqual(BREAD);
    });

    it('leaves the line it was given unchanged', () => {
        checkLine(BREAD, ME);
        expect(BREAD.checked).toBe(false);
    });
});
