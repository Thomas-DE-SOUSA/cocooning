import type { INestApplication } from '@nestjs/common';
import { AgendaExceptionCodeEnum } from '@cocooning/couple-contract/agenda';
import {
    createTestCalendarLabels,
    type TestCalendarLabel,
    truncateAllTables,
} from '@cocooning/couple-e2e-shared/fixtures';
import { PrismaService } from '@cocooning/couple-prisma/nest';
import {
    type CalendarLabel,
    CalendarLabelRepository,
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

const LATER = new Date(NOW.getTime() + 60_000);

const aLabel = (
    suffix: string,
    overrides: Partial<TestCalendarLabel>,
): TestCalendarLabel => ({
    calendarLabelId: `01936b2e-7c4a-7000-8000-0000000001${suffix}`,
    coupleId: COUPLE_ID,
    ownerId: PARTNER_A,
    name: 'Sport',
    color: 'SAGE',
    createdAt: NOW,
    deletedAt: null,
    ...overrides,
});

const SOIREE = aLabel('a2', {
    name: 'Soirée',
    color: 'ROSE',
    createdAt: LATER,
});
const SPORT = aLabel('a1', { ownerId: PARTNER_B });
const DELETED = aLabel('a3', { name: 'Ancienne', deletedAt: NOW });
const OF_ANOTHER_COUPLE = aLabel('c1', {
    coupleId: OTHER_COUPLE_ID,
    ownerId: STRANGER,
    name: 'Autre couple',
});
const CORRUPTED = aLabel('e1', { name: 'Abîmée', color: 'RED' });

describe('Feature: the Prisma adapter of CalendarLabelRepository', () => {
    let app: INestApplication;
    let repository: CalendarLabelRepository;

    beforeAll(async () => {
        app = await createTestApp({ controllers: [], overrides: [] });
        repository = app.get(CalendarLabelRepository);
    });
    afterAll(() => closeTestApp(app));
    beforeEach(async () => {
        const prisma = app.get(PrismaService);
        await truncateAllTables(prisma);
        await createTestCalendarLabels(prisma, [
            SOIREE,
            SPORT,
            DELETED,
            OF_ANOTHER_COUPLE,
        ]);
    });

    const namesOf = (labels: ReadonlyArray<CalendarLabel>) =>
        labels.map((label) => label.toSnapshot().name);

    const found = async (calendarLabelId: string) => {
        const label = await repository.findById(COUPLE_ID, calendarLabelId);
        if (label === null) throw new Error(`${calendarLabelId} not found`);
        return label;
    };

    it('reads the live labels of the couple in creation order, and counts them', async () => {
        expect(namesOf(await repository.findAll(COUPLE_ID))).toEqual([
            'Sport',
            'Soirée',
        ]);
        await expect(repository.countLive(COUPLE_ID)).resolves.toBe(2);
        await expect(
            repository.findById(COUPLE_ID, DELETED.calendarLabelId),
        ).resolves.toBeNull();
    });

    it('gives nothing to another couple (core.md rule 27)', async () => {
        await expect(
            repository.findById(OTHER_COUPLE_ID, SPORT.calendarLabelId),
        ).resolves.toBeNull();
        expect(namesOf(await repository.findAll(OTHER_COUPLE_ID))).toEqual([
            'Autre couple',
        ]);
        await expect(repository.countLive(OTHER_COUPLE_ID)).resolves.toBe(1);
    });

    it('refuses a stale version with CALENDAR_LABEL_VERSION_CONFLICT', async () => {
        const first = await found(SPORT.calendarLabelId);
        const second = await found(SPORT.calendarLabelId);
        first.delete(PARTNER_A, NOW);
        second.delete(PARTNER_B, NOW);
        await repository.save(first);
        await expect(repository.save(second)).rejects.toMatchObject({
            code: AgendaExceptionCodeEnum.CALENDAR_LABEL_VERSION_CONFLICT,
        });
    });

    it('answers CALENDAR_LABEL_DATA_CORRUPTED on an unknown colour', async () => {
        await createTestCalendarLabels(app.get(PrismaService), [CORRUPTED]);
        await expect(
            repository.findById(COUPLE_ID, CORRUPTED.calendarLabelId),
        ).rejects.toMatchObject({
            code: AgendaExceptionCodeEnum.CALENDAR_LABEL_DATA_CORRUPTED,
        });
    });
});
