import type { INestApplication } from '@nestjs/common';
import { AgendaExceptionCodeEnum } from '@cocooning/couple-contract/agenda';
import {
    createTestCalendarEvents,
    type TestCalendarEvent,
    truncateAllTables,
} from '@cocooning/couple-e2e-shared/fixtures';
import { PrismaService } from '@cocooning/couple-prisma/nest';
import {
    type CalendarEvent,
    CalendarEventRepository,
} from '@cocooning/couple-server-business-logic/agenda';
import { closeTestApp, createTestApp } from '../shared/app/create-test-app';
import {
    COUPLE_ID,
    NOW,
    OTHER_COUPLE_ID,
    PARTNER_A,
    PARTNER_B,
    STRANGER,
} from './agenda-test-data';

const anEvent = (
    suffix: string,
    overrides: Partial<TestCalendarEvent>,
): TestCalendarEvent => ({
    calendarEventId: `01936b2e-7c4a-7000-8000-0000000000${suffix}`,
    coupleId: COUPLE_ID,
    ownerId: PARTNER_A,
    title: 'Dîner',
    startsOn: '2026-12-05',
    endsOn: null,
    visibility: 'SHARED',
    audience: 'BOTH',
    labelId: null,
    updatedAt: NOW,
    deletedAt: null,
    ...overrides,
});

const SHARED_OF_A = anEvent('a1', { title: 'Dîner' });
const TRIP_OF_B = anEvent('b1', {
    ownerId: PARTNER_B,
    title: 'Voyage',
    startsOn: '2026-11-28',
    endsOn: '2026-12-02',
});
const PRIVATE_OF_A = anEvent('a2', {
    title: 'Surprise',
    visibility: 'PRIVATE',
    audience: 'OWNER',
});
const DELETED_OF_A = anEvent('a3', { title: 'Annulé', deletedAt: NOW });
const OF_ANOTHER_COUPLE = anEvent('c1', {
    coupleId: OTHER_COUPLE_ID,
    ownerId: STRANGER,
    title: 'Autre couple',
});
const CORRUPTED = anEvent('e1', { title: 'Abîmé', visibility: 'PUBLIC' });
const UNKNOWN_AUDIENCE = anEvent('e2', { title: 'Abîmé', audience: 'FRIENDS' });

describe('Feature: the Prisma adapter of CalendarEventRepository', () => {
    let app: INestApplication;
    let repository: CalendarEventRepository;

    beforeAll(async () => {
        app = await createTestApp({ controllers: [], overrides: [] });
        repository = app.get(CalendarEventRepository);
    });
    afterAll(() => closeTestApp(app));
    beforeEach(async () => {
        const prisma = app.get(PrismaService);
        await truncateAllTables(prisma);
        await createTestCalendarEvents(prisma, [
            SHARED_OF_A,
            TRIP_OF_B,
            PRIVATE_OF_A,
            DELETED_OF_A,
            OF_ANOTHER_COUPLE,
        ]);
    });

    const titlesOf = (calendarEvents: ReadonlyArray<CalendarEvent>) =>
        calendarEvents.map((calendarEvent) => calendarEvent.toSnapshot().title);

    const visible = async (userId: string, calendarEventId: string) => {
        const found = await repository.findVisibleById(
            COUPLE_ID,
            userId,
            calendarEventId,
        );
        if (found === null) throw new Error(`${calendarEventId} not visible`);
        return found;
    };

    it('reads the days of a range, an event over several days included, without the hidden ones', async () => {
        const seenByB = await repository.findVisibleOverlapping(
            COUPLE_ID,
            PARTNER_B,
            '2026-12-01',
            '2026-12-31',
        );
        expect(titlesOf(seenByB)).toEqual(['Voyage', 'Dîner']);
        expect(seenByB[0]?.toSnapshot()).toMatchObject({
            startsOn: '2026-11-28',
            endsOn: '2026-12-02',
        });
    });

    it('gives nothing to another couple (core.md rule 27)', async () => {
        await expect(
            repository.findVisibleById(
                OTHER_COUPLE_ID,
                STRANGER,
                SHARED_OF_A.calendarEventId,
            ),
        ).resolves.toBeNull();
    });

    it('refuses a stale version with CALENDAR_EVENT_VERSION_CONFLICT', async () => {
        const first = await visible(PARTNER_A, SHARED_OF_A.calendarEventId);
        const second = await visible(PARTNER_B, SHARED_OF_A.calendarEventId);
        first.share(PARTNER_A, NOW);
        second.delete(PARTNER_B, NOW);
        await repository.save(first);
        await expect(repository.save(second)).rejects.toMatchObject({
            code: AgendaExceptionCodeEnum.CALENDAR_EVENT_VERSION_CONFLICT,
        });
    });

    it.each([
        ['an unknown visibility', CORRUPTED],
        ['an unknown audience', UNKNOWN_AUDIENCE],
    ])(
        'answers CALENDAR_EVENT_DATA_CORRUPTED on %s',
        async (_label, corrupted) => {
            await createTestCalendarEvents(app.get(PrismaService), [corrupted]);
            await expect(
                repository.findVisibleById(
                    COUPLE_ID,
                    PARTNER_A,
                    corrupted.calendarEventId,
                ),
            ).rejects.toMatchObject({
                code: AgendaExceptionCodeEnum.CALENDAR_EVENT_DATA_CORRUPTED,
            });
        },
    );
});
