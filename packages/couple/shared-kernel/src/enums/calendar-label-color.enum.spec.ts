import { CalendarLabelColorEnum } from './calendar-label-color.enum';

describe('Feature: the colour of a calendar label', () => {
    describe('Scenario: listing the colours', () => {
        it('has the eight tints of the palette, each value equal to its key', () => {
            expect(CalendarLabelColorEnum).toEqual({
                SAGE: 'SAGE',
                ROSE: 'ROSE',
                TERRACOTTA: 'TERRACOTTA',
                OCHRE: 'OCHRE',
                SLATE: 'SLATE',
                PLUM: 'PLUM',
                MINT: 'MINT',
                PEBBLE: 'PEBBLE',
            });
        });
    });
});
