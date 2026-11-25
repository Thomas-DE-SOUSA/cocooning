import { CalendarEventAudienceEnum } from '@cocooning/couple-shared-kernel/enums';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import type { CalendarEventDetailsInput } from '../../domain/value-objects/calendar-event-details';

export const NOW = new Date('2026-11-24T10:00:00.000Z');
export const MILLISECONDS_PER_HOUR = 3_600_000;
export const COUPLE_ID = 'c0000000-0000-7000-8000-0000000000c1';
export const OTHER_COUPLE_ID = 'c0000000-0000-7000-8000-0000000000c2';
export const PARTNER_A = 'a0000000-0000-7000-8000-00000000000a';
export const PARTNER_B = 'b0000000-0000-7000-8000-00000000000b';
export const STRANGER = 'd0000000-0000-7000-8000-00000000000d';
export const AS_A: ExecutionContext = {
    coupleId: COUPLE_ID,
    userId: PARTNER_A,
};
export const AS_B: ExecutionContext = {
    coupleId: COUPLE_ID,
    userId: PARTNER_B,
};
export const AS_STRANGER: ExecutionContext = {
    coupleId: OTHER_COUPLE_ID,
    userId: STRANGER,
};
export const FIRST_ID = '00000000-0000-7000-8000-000000000001';

// A one-day event at 20:00, the default of the given steps.
export const DINNER: CalendarEventDetailsInput = {
    title: 'Dîner chez Paul',
    description: null,
    startsOn: '2026-12-05',
    endsOn: null,
    startsAt: '20:00',
    endsAt: null,
    audience: CalendarEventAudienceEnum.BOTH,
    labelId: null,
};

// A weekend: two days, no hour, so all day long.
export const WEEKEND: CalendarEventDetailsInput = {
    title: 'Week-end à Lyon',
    description: 'Train de 8 h 12',
    startsOn: '2026-12-12',
    endsOn: '2026-12-13',
    startsAt: null,
    endsAt: null,
    audience: CalendarEventAudienceEnum.BOTH,
    labelId: null,
};
