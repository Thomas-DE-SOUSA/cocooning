import type { CalendarEventForm } from '@cocooning/couple-client-business-logic/agenda';
import { CalendarEventVisibilityChangeEnum } from '../view-models/calendar-event-command.view-model';
import {
    isNothingToSave,
    presentCalendarEventSave,
} from './calendar-event-save.presenter';

const A_DINNER: CalendarEventForm = {
    title: 'Dîner chez Léa',
    description: null,
    startsOn: '2026-12-05',
    endsOn: null,
    startsAt: '20:00',
    endsAt: null,
    isPrivate: false,
};

describe('Feature: what saving an edited event sends', () => {
    it('sends nothing when nothing changed', () => {
        const save = presentCalendarEventSave(A_DINNER, { ...A_DINNER });

        expect(save).toEqual({ editsDetails: false, visibilityChange: null });
        expect(isNothingToSave(save)).toBe(true);
    });

    it.each([
        ['the title', { title: 'Dîner chez Paul' }],
        ['the description', { description: 'Apporter le dessert' }],
        ['the last day', { endsOn: '2026-12-06' }],
        ['the end hour', { endsAt: '23:00' }],
    ])('R9, sends the details when %s changed', (_label, change) => {
        const save = presentCalendarEventSave(A_DINNER, {
            ...A_DINNER,
            ...change,
        });

        expect(save).toEqual({ editsDetails: true, visibilityChange: null });
    });

    it('R8, makes the event private through its own command', () => {
        expect(
            presentCalendarEventSave(A_DINNER, {
                ...A_DINNER,
                isPrivate: true,
            }),
        ).toEqual({
            editsDetails: false,
            visibilityChange: CalendarEventVisibilityChangeEnum.MAKE_PRIVATE,
        });
    });

    it('R8, shares a private event while sending the new title', () => {
        const save = presentCalendarEventSave(
            { ...A_DINNER, isPrivate: true },
            { ...A_DINNER, title: 'Dîner chez Paul' },
        );

        expect(save).toEqual({
            editsDetails: true,
            visibilityChange: CalendarEventVisibilityChangeEnum.SHARE,
        });
        expect(isNothingToSave(save)).toBe(false);
    });
});
