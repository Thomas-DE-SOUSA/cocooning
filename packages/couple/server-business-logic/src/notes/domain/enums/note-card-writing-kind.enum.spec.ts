import { NoteCardWritingKindEnum } from './note-card-writing-kind.enum';

describe('Feature: what the AI makes of a search (R19, R21)', () => {
    it('answers candidates or values, each value equal to its key', () => {
        expect(NoteCardWritingKindEnum).toEqual({
            CANDIDATES: 'CANDIDATES',
            VALUES: 'VALUES',
        });
    });
});
