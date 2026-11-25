import { CalendarEventAudienceEnum } from './calendar-event-audience.enum';

describe('Feature: who a calendar event is for', () => {
    describe('Scenario: listing the audiences', () => {
        it('has the author, the partner and both, each value equal to its key', () => {
            expect(CalendarEventAudienceEnum).toEqual({
                OWNER: 'OWNER',
                PARTNER: 'PARTNER',
                BOTH: 'BOTH',
            });
        });
    });
});
