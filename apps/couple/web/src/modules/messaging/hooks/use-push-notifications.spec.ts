import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import { A_PUSH_SUBSCRIPTION } from '@cocooning/couple-client-business-logic/testing';
import { act, renderHook, waitFor } from '@testing-library/react';
import { FakePhonePushGateway } from '../gateways/fake/fake-phone-push.gateway';
import {
    A_PHONE_PUBLIC_KEY,
    FakePushSubscriptionCommandGateway,
} from '../gateways/fake/fake-push-subscription-command.gateway';
import { usePushNotifications } from './use-push-notifications';

const ENDPOINT = A_PUSH_SUBSCRIPTION.endpoint;
const A_SUBSCRIBED_PHONE = {
    isSupported: true,
    permission: 'granted',
    subscription: A_PUSH_SUBSCRIPTION,
} as const;

const anError = (backendCode: string | null): ApiError => ({
    code: ApiErrorCodeEnum.NOT_FOUND,
    message: 'Refused',
    backendCode,
});

async function renderSwitch(
    phone: FakePhonePushGateway,
    server: FakePushSubscriptionCommandGateway,
) {
    const events: string[] = [];
    const { result } = renderHook(() =>
        usePushNotifications({
            phone,
            server,
            onApiFailed: (error) => events.push(`apiFailed:${error.code}`),
            onPhoneRefused: () => events.push('phoneRefused'),
        }),
    );
    await waitFor(() => expect(result.current.status).not.toBe('CHECKING'));
    return { result, events };
}

describe('Feature: R11, a partner turns the notifications of this phone on', () => {
    let phone: FakePhonePushGateway;
    let server: FakePushSubscriptionCommandGateway;

    beforeEach(() => {
        phone = new FakePhonePushGateway();
        server = new FakePushSubscriptionCommandGateway();
        phone.givenSubscription(A_PUSH_SUBSCRIPTION);
    });

    it('asks the permission first, then subscribes the phone with the key of the API', async () => {
        const { result, events } = await renderSwitch(phone, server);

        await act(() => result.current.turnOn());

        expect(phone.calls).toEqual([
            'readState',
            'requestPermission',
            `subscribe:${A_PHONE_PUBLIC_KEY}`,
        ]);
        expect(server.calls).toEqual([
            'getPushPublicKey',
            `subscribe:${ENDPOINT}`,
        ]);
        expect(result.current.status).toBe('ON');
        expect(result.current.isPending).toBe(false);
        expect(events).toEqual([]);
    });

    it('shows the notifications blocked when the partner refuses the permission', async () => {
        phone.givenPermissionAnswer('denied');
        const { result } = await renderSwitch(phone, server);

        await act(() => result.current.turnOn());

        expect(server.calls).toEqual([]);
        expect(result.current.status).toBe('BLOCKED');
    });

    it('stays off when the partner closes the prompt without answering', async () => {
        phone.givenPermissionAnswer('default');
        const { result } = await renderSwitch(phone, server);

        await act(() => result.current.turnOn());

        expect(result.current.status).toBe('OFF');
    });

    it('reports a phone that refuses to subscribe', async () => {
        phone.givenSubscription(null);
        const { result, events } = await renderSwitch(phone, server);

        await act(() => result.current.turnOn());

        expect(events).toEqual(['phoneRefused']);
        expect(result.current.status).toBe('OFF');
    });

    it('drops the subscription of the phone when the API refuses it', async () => {
        server.givenRefusal('subscribe', anError('PUSH_SUBSCRIPTION_INVALID'));
        const { result, events } = await renderSwitch(phone, server);

        await act(() => result.current.turnOn());

        expect(events).toEqual(['apiFailed:NOT_FOUND']);
        expect(phone.calls.at(-1)).toBe('unsubscribe');
        expect(result.current.status).toBe('OFF');
    });

    it('does not subscribe without the public key', async () => {
        server.givenRefusal('getPushPublicKey', anError(null));
        const { result, events } = await renderSwitch(phone, server);

        await act(() => result.current.turnOn());

        expect(phone.calls).not.toContain(`subscribe:${A_PHONE_PUBLIC_KEY}`);
        expect(events).toEqual(['apiFailed:NOT_FOUND']);
    });
});

describe('Feature: R11, a partner turns the notifications of this phone off', () => {
    let phone: FakePhonePushGateway;
    let server: FakePushSubscriptionCommandGateway;

    beforeEach(() => {
        phone = new FakePhonePushGateway();
        server = new FakePushSubscriptionCommandGateway();
        phone.givenState(A_SUBSCRIBED_PHONE);
    });

    it('reads a subscribed phone as on', async () => {
        const { result } = await renderSwitch(phone, server);

        expect(result.current.status).toBe('ON');
    });

    it('makes the API forget the phone, then unsubscribes it', async () => {
        const { result } = await renderSwitch(phone, server);

        await act(() => result.current.turnOff());

        expect(server.calls).toEqual([`unsubscribe:${ENDPOINT}`]);
        expect(phone.calls).toEqual(['readState', 'unsubscribe']);
        expect(result.current.status).toBe('OFF');
    });

    it('unsubscribes the phone the API has already forgotten', async () => {
        server.givenRefusal(
            'unsubscribe',
            anError('PUSH_SUBSCRIPTION_NOT_FOUND'),
        );
        const { result, events } = await renderSwitch(phone, server);

        await act(() => result.current.turnOff());

        expect(events).toEqual([]);
        expect(result.current.status).toBe('OFF');
    });

    it('stays on when the API refuses', async () => {
        server.givenRefusal('unsubscribe', {
            code: ApiErrorCodeEnum.NETWORK_ERROR,
            message: 'Unreachable',
            backendCode: null,
        });
        const { result, events } = await renderSwitch(phone, server);

        await act(() => result.current.turnOff());

        expect(phone.calls).toEqual(['readState']);
        expect(events).toEqual(['apiFailed:NETWORK_ERROR']);
        expect(result.current.status).toBe('ON');
    });

    it('stays on when the phone keeps its subscription', async () => {
        phone.givenUnsubscribeRefused();
        const { result, events } = await renderSwitch(phone, server);

        await act(() => result.current.turnOff());

        expect(events).toEqual(['phoneRefused']);
        expect(result.current.status).toBe('ON');
    });
});
