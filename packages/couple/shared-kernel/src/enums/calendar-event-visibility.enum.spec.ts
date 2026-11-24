import { CalendarEventVisibilityEnum } from './calendar-event-visibility.enum';

describe('Feature: visibility of a calendar event', () => {
    describe('Scenario: listing the visibilities', () => {
        it('has a private and a shared visibility, each value equal to its key', () => {
            expect(CalendarEventVisibilityEnum).toEqual({
                PRIVATE: 'PRIVATE',
                SHARED: 'SHARED',
            });
        });
    });
});
