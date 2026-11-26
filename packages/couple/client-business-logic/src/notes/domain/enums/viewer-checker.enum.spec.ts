import { ViewerCheckerEnum } from './viewer-checker.enum';

describe('Feature: who checked a line, seen by the partner who reads it', () => {
    it('says « Moi » or « Toi », each value equal to its key', () => {
        expect(ViewerCheckerEnum).toEqual({ ME: 'ME', YOU: 'YOU' });
    });
});
