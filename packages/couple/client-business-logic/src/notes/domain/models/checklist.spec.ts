import { ViewerCheckerEnum } from '../enums/viewer-checker.enum';
import { linesToClear, presentChecklist } from './checklist';

const ME = '01936b2e-7c4a-7000-8000-0000000000a1';
const YOU = '01936b2e-7c4a-7000-8000-0000000000a2';
const line = (id: string, checkedBy: string | null, checked = true) => ({
    id,
    text: id,
    checked,
    checkedBy,
});
const MILK = line('Lait', null, false);
const BREAD = line('Pain', ME);
const EGGS = line('Oeufs', null, false);
const APPLES = line('Pommes', YOU);
const OLD_LINE = line('Sel', null);
const LINES = [BREAD, MILK, APPLES, EGGS, OLD_LINE];

describe('Feature: a list seen by the partner who reads it (R29, R30)', () => {
    it('keeps the open lines on top, in the order of the document', () => {
        expect(presentChecklist(LINES, ME).open).toEqual([MILK, EGGS]);
    });

    it('moves the checked lines to « Fait », in the order of the document', () => {
        expect(presentChecklist(LINES, ME).done).toEqual([
            { ...BREAD, checkedByViewer: ViewerCheckerEnum.ME },
            { ...APPLES, checkedByViewer: ViewerCheckerEnum.YOU },
            { ...OLD_LINE, checkedByViewer: null },
        ]);
    });

    it('tells the other partner « Toi » for my check, « Moi » for theirs', () => {
        const done = presentChecklist(LINES, YOU).done;
        expect(done.map(({ checkedByViewer }) => checkedByViewer)).toEqual([
            ViewerCheckerEnum.YOU,
            ViewerCheckerEnum.ME,
            null,
        ]);
    });

    it('presents an empty list with nothing open and nothing done', () => {
        expect(presentChecklist([], ME)).toEqual({ open: [], done: [] });
    });
});

describe('Feature: « Vider les faits » (R31)', () => {
    it('clears every checked line, whoever checked it', () => {
        expect(linesToClear(LINES)).toEqual([BREAD, APPLES, OLD_LINE]);
    });

    it('clears nothing when no line is checked', () => {
        expect(linesToClear([MILK, EGGS])).toEqual([]);
    });
});
