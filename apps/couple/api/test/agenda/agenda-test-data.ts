import {
    type CalendarEventResponse,
    CalendarEventResponseSchema,
    type CalendarLabelResponse,
    CalendarLabelResponseSchema,
} from '@cocooning/couple-contract/agenda';
import type {
    TestAccount,
    TestCouple,
} from '@cocooning/couple-e2e-shared/fixtures';
import type { TestResponse } from '../shared/app/test-client';

export const NOW = new Date('2026-11-24T10:00:00.000Z');
export const COUPLE_ID = '01936b2e-7c4a-7000-8000-0000000000f1';
export const OTHER_COUPLE_ID = '01936b2e-7c4a-7000-8000-0000000000f2';
export const PARTNER_A = '01936b2e-7c4a-7000-8000-00000000000a';
export const PARTNER_B = '01936b2e-7c4a-7000-8000-00000000000b';
export const STRANGER = '01936b2e-7c4a-7000-8000-00000000000c';
export const ALONE = '01936b2e-7c4a-7000-8000-00000000000d';
export const PARTNERS = [PARTNER_A, PARTNER_B, STRANGER, ALONE] as const;
export const UNKNOWN_CALENDAR_EVENT_ID = '01936b2e-7c4a-7000-8000-0000000000ff';
export const UNKNOWN_CALENDAR_LABEL_ID = '01936b2e-7c4a-7000-8000-0000000000fe';
export const DECEMBER = { from: '2026-12-01', to: '2026-12-31' };

export type CalendarEventBody = {
    readonly title: string;
    readonly description: string | null;
    readonly startsOn: string;
    readonly endsOn: string | null;
    readonly startsAt: string | null;
    readonly endsAt: string | null;
    readonly audience: string;
    readonly visibility: string;
};

// A one-day event at 20:00, shared: the body most specs send.
export const DINNER: CalendarEventBody = {
    title: 'Dîner chez Paul',
    description: null,
    startsOn: '2026-12-05',
    endsOn: null,
    startsAt: '20:00',
    endsAt: '23:00',
    audience: 'BOTH',
    visibility: 'SHARED',
};

// R11: an event kept "rien que pour moi" is for its author.
export const PRIVATE_DINNER: CalendarEventBody = {
    ...DINNER,
    audience: 'OWNER',
    visibility: 'PRIVATE',
};

// A weekend over two days, all day long, as the edit form sends it and as created shared.
export const WEEKEND_DETAILS: Omit<CalendarEventBody, 'visibility'> = {
    title: 'Week-end à Lyon',
    description: 'Train de 8 h 12',
    startsOn: '2026-12-12',
    endsOn: '2026-12-13',
    startsAt: null,
    endsAt: null,
    audience: 'BOTH',
};
export const WEEKEND: CalendarEventBody = {
    ...WEEKEND_DETAILS,
    visibility: 'SHARED',
};

// The guard loads the account of every session (decision 0034); the agenda never signs in, so the hash is never checked.
export const partnerAccount = (userId: string): TestAccount => ({
    accountId: userId,
    emailAddress: `${userId}@cocooning.test`,
    passwordHash: 'never-checked-by-agenda',
    sessionVersion: 1,
    createdAt: NOW,
    deletedAt: null,
});

// A and B form the couple of the agenda, the stranger another one; ALONE has no couple (R4).
const pairedCouple = (
    coupleId: string,
    partnerUserIds: string[],
): TestCouple => ({
    coupleId,
    partnerUserIds,
    pairingStatus: 'PAIRED',
    invitationCode: null,
    invitationCodeExpiresAt: null,
    createdAt: NOW,
});
export const COUPLES = [
    pairedCouple(COUPLE_ID, [PARTNER_A, PARTNER_B]),
    pairedCouple(OTHER_COUPLE_ID, [STRANGER]),
];

export const refusal = (status: number, code: string, message: string) => ({
    status,
    body: { status, code, message, context: null },
});

export type CalendarLabelBody = {
    readonly name: string;
    readonly color: string;
};

export const SPORT: CalendarLabelBody = { name: 'Sport', color: 'SAGE' };

export const calendarLabelOf = (
    response: TestResponse,
): CalendarLabelResponse => CalendarLabelResponseSchema.parse(response.body);

export const calendarEventOf = (
    response: TestResponse,
): CalendarEventResponse => CalendarEventResponseSchema.parse(response.body);
