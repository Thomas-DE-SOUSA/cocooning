import { PushDeliveryOutcomeEnum } from '@cocooning/couple-server-business-logic/messaging';
import { WebPushError } from 'web-push';
import { pushDeliveryOutcomeOf } from './push-delivery-outcome-of';

const refusedWith = (statusCode: number): WebPushError =>
    new WebPushError('refused', statusCode, {}, '', 'https://push.test/a');

describe('Feature: what a refusal of the push service means (R11)', () => {
    it.each([404, 410])('forgets a subscription answered %i', (statusCode) => {
        expect(pushDeliveryOutcomeOf(refusedWith(statusCode))).toBe(
            PushDeliveryOutcomeEnum.GONE,
        );
    });

    it.each([
        ['a throttled request', refusedWith(429)],
        ['a push service down', refusedWith(503)],
        ['a socket timeout', new Error('Socket timeout')],
    ])('keeps the subscription after %s', (_label, error) => {
        expect(pushDeliveryOutcomeOf(error)).toBe(
            PushDeliveryOutcomeEnum.FAILED,
        );
    });
});
