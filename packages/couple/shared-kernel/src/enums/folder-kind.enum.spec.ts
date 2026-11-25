import { FolderKindEnum } from './folder-kind.enum';

describe('Feature: the kinds of folder (R17)', () => {
    describe('Scenario: listing the kinds', () => {
        it('has a classic and a smart kind, each value equal to its key', () => {
            expect(FolderKindEnum).toEqual({
                CLASSIC: 'CLASSIC',
                SMART: 'SMART',
            });
        });
    });
});
