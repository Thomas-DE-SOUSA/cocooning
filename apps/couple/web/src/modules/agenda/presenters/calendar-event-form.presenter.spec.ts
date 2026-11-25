import {
    AuthorColorEnum,
    type AgendaDayItem,
} from '../view-models/agenda-screen.view-model';
import {
    presentCalendarEventOf,
    presentNewCalendarEvent,
    toCalendarEventFormInput,
} from './calendar-event-form.presenter';

const A_STAY: AgendaDayItem = {
    calendarEventId: 'event-stay',
    title: 'Week-end à Annecy',
    description: null,
    startsAt: null,
    endsAt: null,
    span: null,
    moment: {
        startsOn: '2026-11-28',
        endsOn: '2026-11-29',
        startsAt: '18:00',
        endsAt: null,
    },
    isOwner: true,
    isPrivate: true,
    audience: 'ME',
    labelId: '01936b2e-7c4a-7000-8000-0000000000b1',
    color: AuthorColorEnum.TERRACOTTA,
};

describe('Feature: what the drawer starts from', () => {
    it('R3, R5, R11, starts a new event on the chosen day, all day, shared, for both', () => {
        expect(
            toCalendarEventFormInput(presentNewCalendarEvent('2026-11-24')),
        ).toEqual({
            title: '',
            description: '',
            startsOn: '2026-11-24',
            endsOn: '',
            startsAt: '',
            endsAt: '',
            isPrivate: false,
            audience: 'BOTH',
            labelId: null,
        });
    });

    it('edits the whole moment of an event, not the hours of the day shown, with who it is for and its label', () => {
        expect(presentCalendarEventOf(A_STAY)).toEqual({
            title: 'Week-end à Annecy',
            description: null,
            startsOn: '2026-11-28',
            endsOn: '2026-11-29',
            startsAt: '18:00',
            endsAt: null,
            isPrivate: true,
            audience: 'ME',
            labelId: '01936b2e-7c4a-7000-8000-0000000000b1',
        });
    });

    it('writes each missing part as an empty input', () => {
        expect(
            toCalendarEventFormInput(presentCalendarEventOf(A_STAY)),
        ).toMatchObject({ description: '', startsAt: '18:00', endsAt: '' });
    });
});
