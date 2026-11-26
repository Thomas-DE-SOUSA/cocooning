import type { CalendarLabelItem } from '../view-models/calendar-label.view-model';
import {
    presentCalendarLabelOf,
    presentNewCalendarLabel,
} from './calendar-label-form.presenter';
import { mergeCalendarLabels } from './calendar-labels.presenter';

const SPORT: CalendarLabelItem = {
    calendarLabelId: '01936b2e-7c4a-7000-8000-0000000000b1',
    name: 'Sport',
    color: 'SAGE',
};
const FAMILY: CalendarLabelItem = {
    calendarLabelId: '01936b2e-7c4a-7000-8000-0000000000b2',
    name: 'Famille',
    color: 'ROSE',
};

describe('Feature: what the label sheet starts from (R12)', () => {
    it('starts a new label without a name, on the first colour not used yet', () => {
        expect(presentNewCalendarLabel([])).toEqual({
            name: '',
            color: 'SAGE',
        });
        expect(presentNewCalendarLabel([SPORT, FAMILY])).toEqual({
            name: '',
            color: 'TERRACOTTA',
        });
    });

    it('starts on the first colour when the eight are taken', () => {
        const colors = [
            'SAGE',
            'ROSE',
            'TERRACOTTA',
            'OCHRE',
            'SLATE',
            'PLUM',
            'MINT',
            'PEBBLE',
        ] as const;
        const labels = colors.map((color) => ({ ...SPORT, color }));

        expect(presentNewCalendarLabel(labels).color).toBe('SAGE');
    });

    it('starts an edited label from its name and colour', () => {
        expect(presentCalendarLabelOf(FAMILY)).toEqual({
            name: 'Famille',
            color: 'ROSE',
        });
    });
});

describe('Feature: the labels the event sheet offers', () => {
    it('adds the labels created in the sheet after those read, once each', () => {
        const created = { ...FAMILY, calendarLabelId: 'created' };

        expect(mergeCalendarLabels([SPORT, FAMILY], [FAMILY, created])).toEqual(
            [SPORT, FAMILY, created],
        );
    });
});
