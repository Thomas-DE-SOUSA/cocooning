import { AgendaExceptionCodeEnum } from '@cocooning/couple-contract/agenda';
import { AuthenticationExceptionCodeEnum } from '@cocooning/couple-contract/authentication';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { AgendaTestApp } from './agenda-test-app';
import {
    ALONE,
    calendarLabelOf,
    NOW,
    PARTNER_A,
    PARTNER_B,
    refusal,
    STRANGER,
} from './agenda-test-data';

const LATER = new Date(NOW.getTime() + 60_000);

describe('Feature: a partner lists the labels of the couple (R12)', () => {
    const agenda = new AgendaTestApp();

    beforeAll(() => agenda.start());
    afterAll(() => agenda.stop());
    beforeEach(() => agenda.reset());

    it('answers 200 with the same labels for both partners, in creation order', async () => {
        const sport = calendarLabelOf(await agenda.createLabel(PARTNER_B));
        agenda.clock.setNow(LATER);
        const soiree = calendarLabelOf(
            await agenda.createLabel(PARTNER_A, {
                name: 'Soirée',
                color: 'ROSE',
            }),
        );
        const expected = { status: 200, body: { items: [sport, soiree] } };
        expect(await agenda.listLabels(PARTNER_A)).toEqual(expected);
        expect(await agenda.listLabels(PARTNER_B)).toEqual(expected);
        expect(soiree).toMatchObject({
            name: 'Soirée',
            color: 'ROSE',
            updatedAt: LATER.toISOString(),
        });
    });

    it('gives another couple none of them (core.md rule 27)', async () => {
        await agenda.createLabel(PARTNER_A);
        expect(await agenda.listLabels(STRANGER)).toEqual({
            status: 200,
            body: { items: [] },
        });
    });

    it('answers 404 without a formed couple (R4)', async () => {
        expect(await agenda.listLabels(ALONE)).toEqual(
            refusal(
                404,
                AgendaExceptionCodeEnum.CALENDAR_EVENT_COUPLE_NOT_PAIRED,
                'The agenda needs a formed couple',
            ),
        );
    });

    it('answers 401 without a session', async () => {
        const response = await agenda
            .unauthenticated()
            .get(ApiRouterEnum.CALENDAR_LABEL_LIST);
        expect(response.body).toMatchObject({
            status: 401,
            code: AuthenticationExceptionCodeEnum.AUTHENTICATION_SESSION_MISSING,
        });
    });
});
