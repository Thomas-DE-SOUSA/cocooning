import { FakeFetch } from '@cocooning/client-infrastructure/testing';
import { ApiErrorCodeEnum } from '@cocooning/couple-client-business-logic/shared';
import {
    A_CALENDAR_LABEL,
    A_CALENDAR_LABEL_LIST,
} from '@cocooning/couple-client-business-logic/testing';
import { AgendaExceptionCodeEnum } from '@cocooning/couple-contract/agenda';
import { CalendarLabelColorEnum } from '@cocooning/couple-shared-kernel/enums';
import { fail, ok } from '@cocooning/shared-kernel/utils';
import { createCoupleHttpConfig } from '../../couple-http-config';
import { resolveCalendarLabelsEndpoints } from '../endpoints/calendar-labels.endpoints';
import { ApiCalendarLabelsGateway } from './api-calendar-labels.gateway';

const LABEL_ID = A_CALENDAR_LABEL.calendarLabelId;
const SESSION_COOKIE = { Cookie: 'cocooning_session=session-token-1' };
const ACCEPT = { Accept: 'application/json' };
const JSON_BODY = { ...ACCEPT, 'Content-Type': 'application/json' };
const FAMILY = { name: 'Famille', color: CalendarLabelColorEnum.ROSE };

const aGateway = (token: string | null = 'session-token-1') =>
    new ApiCalendarLabelsGateway(
        resolveCalendarLabelsEndpoints('http://api.test'),
        createCoupleHttpConfig(5000),
        () => Promise.resolve(token),
    );

const anApiRefusal = (status: number, code: string, message: string) =>
    JSON.stringify({ status, code, message, context: null });

describe('Feature: the PWA reaches the labels of the couple through the API', () => {
    let fakeFetch: FakeFetch;

    beforeEach(() => {
        fakeFetch = new FakeFetch();
        fakeFetch.install();
    });
    afterEach(() => fakeFetch.restore());

    describe('Scenario: each action for the signed-in partner (R12, R14)', () => {
        it('lists the labels with the session cookie', async () => {
            fakeFetch.givenResponse(200, JSON.stringify(A_CALENDAR_LABEL_LIST));
            await expect(aGateway().list()).resolves.toEqual(
                ok(A_CALENDAR_LABEL_LIST),
            );
            expect(fakeFetch.calls).toEqual([
                {
                    url: 'http://api.test/calendar-labels',
                    method: 'GET',
                    headers: { ...ACCEPT, ...SESSION_COOKIE },
                    body: null,
                },
            ]);
        });

        it('creates with a trimmed name and edits name and colour together', async () => {
            fakeFetch.givenResponse(200, JSON.stringify(A_CALENDAR_LABEL));
            await expect(
                aGateway().create({ ...FAMILY, name: ' Famille ' }),
            ).resolves.toEqual(ok(A_CALENDAR_LABEL));
            await aGateway().edit(LABEL_ID, FAMILY);
            expect(fakeFetch.calls).toEqual([
                {
                    url: 'http://api.test/calendar-labels',
                    method: 'POST',
                    headers: { ...JSON_BODY, ...SESSION_COOKIE },
                    body: JSON.stringify(FAMILY),
                },
                {
                    url: `http://api.test/calendar-labels/${LABEL_ID}`,
                    method: 'PATCH',
                    headers: { ...JSON_BODY, ...SESSION_COOKIE },
                    body: JSON.stringify(FAMILY),
                },
            ]);
        });

        it('deletes a label from a 204 without body', async () => {
            fakeFetch.givenResponse(204, '');
            await expect(aGateway().delete(LABEL_ID)).resolves.toEqual(
                ok(null),
            );
            expect(fakeFetch.calls[0]).toMatchObject({
                url: `http://api.test/calendar-labels/${LABEL_ID}`,
                method: 'DELETE',
            });
        });
    });

    describe('Scenario: the API refuses a label', () => {
        it.each([
            [
                'the 21st label',
                409,
                AgendaExceptionCodeEnum.CALENDAR_LABEL_LIMIT_REACHED,
                ApiErrorCodeEnum.CONFLICT,
                () => aGateway().create(FAMILY),
            ],
            [
                'an unknown label',
                404,
                AgendaExceptionCodeEnum.CALENDAR_LABEL_NOT_FOUND,
                ApiErrorCodeEnum.NOT_FOUND,
                () => aGateway().delete(LABEL_ID),
            ],
        ])(
            'returns %s with the backend code',
            async (_label, status, backendCode, code, send) => {
                const message = 'Refused';
                fakeFetch.givenResponse(
                    status,
                    anApiRefusal(status, backendCode, message),
                );
                await expect(send()).resolves.toEqual(
                    fail({ code, message, backendCode }),
                );
            },
        );
    });

    describe('Scenario: a request outside the contract or without session', () => {
        it.each([
            [
                'an empty name',
                () => aGateway().create({ ...FAMILY, name: ' ' }),
            ],
            [
                'a colour outside the palette',
                () =>
                    aGateway().edit(LABEL_ID, {
                        ...FAMILY,
                        color: 'RED' as typeof FAMILY.color,
                    }),
            ],
        ])('refuses %s without calling the API', async (_label, send) => {
            const result = await send();
            expect(result.success === false && result.error.code).toBe(
                ApiErrorCodeEnum.VALIDATION_ERROR,
            );
            expect(fakeFetch.calls).toEqual([]);
        });

        it('refuses without calling the API when there is no session', async () => {
            const result = await aGateway(null).list();
            expect(result.success === false && result.error.code).toBe(
                ApiErrorCodeEnum.UNAUTHORIZED,
            );
            expect(fakeFetch.calls).toEqual([]);
        });
    });
});
