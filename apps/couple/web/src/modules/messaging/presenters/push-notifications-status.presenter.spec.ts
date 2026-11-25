import { A_PUSH_SUBSCRIPTION } from '@cocooning/couple-client-business-logic/testing';
import type { PhonePushState } from '../view-models/push-notifications.view-model';
import { presentPushNotificationsStatus } from './push-notifications-status.presenter';

const aPhone = (overrides: Partial<PhonePushState>): PhonePushState => ({
    isSupported: true,
    permission: 'default',
    subscription: null,
    ...overrides,
});

describe('Feature: R11, the notifications of this phone', () => {
    it('checks the phone until it has been read', () => {
        expect(presentPushNotificationsStatus(null)).toBe('CHECKING');
    });

    it.each([
        [
            'a browser without push (an iPhone outside the home screen)',
            aPhone({ isSupported: false }),
            'UNSUPPORTED',
        ],
        [
            'a permission refused in the phone settings',
            aPhone({ permission: 'denied', subscription: A_PUSH_SUBSCRIPTION }),
            'BLOCKED',
        ],
        ['a permission never asked', aPhone({}), 'OFF'],
        [
            'a permission given without subscription',
            aPhone({ permission: 'granted' }),
            'OFF',
        ],
        [
            'a subscription without permission',
            aPhone({ subscription: A_PUSH_SUBSCRIPTION }),
            'OFF',
        ],
        [
            'a subscribed phone',
            aPhone({
                permission: 'granted',
                subscription: A_PUSH_SUBSCRIPTION,
            }),
            'ON',
        ],
    ])('presents %s', (_label, state, status) => {
        expect(presentPushNotificationsStatus(state)).toBe(status);
    });
});
