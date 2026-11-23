import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import { fail } from '@cocooning/shared-kernel/utils';
import { act, renderHook } from '@testing-library/react';
import { FakePairingCommandGateway } from '../gateways/fake/fake-pairing-command.gateway';
import { usePairingCommands } from './use-pairing-commands';

const REFUSAL: ApiError = {
    code: ApiErrorCodeEnum.CONFLICT,
    message: 'Couple already paired',
    backendCode: 'PAIRING_COUPLE_ALREADY_PAIRED',
};

function renderCommands(gateway: FakePairingCommandGateway) {
    const events: string[] = [];
    const { result } = renderHook(() =>
        usePairingCommands({
            gateway,
            onDone: () => events.push('done'),
            onCreateFailed: (error) => events.push(`create:${error.code}`),
            onRenewFailed: (error) => events.push(`renew:${error.code}`),
        }),
    );
    return { result, events };
}

describe('Feature: pairing commands from the screen', () => {
    describe('Scenario: R2, the partner creates the couple', () => {
        it('sends the command once and asks for a refresh', async () => {
            const gateway = new FakePairingCommandGateway();
            const { result, events } = renderCommands(gateway);

            await act(async () => result.current.createCouple());

            expect(gateway.calls).toEqual([{ operation: 'createCouple' }]);
            expect(events).toEqual(['done']);
            expect(result.current.isPending).toBe(false);
        });
    });

    describe('Scenario: R7, the creator renews the code', () => {
        it('reports a refusal to the renew callback without refreshing', async () => {
            const gateway = new FakePairingCommandGateway();
            gateway.givenOutcome(fail(REFUSAL));
            const { result, events } = renderCommands(gateway);

            await act(async () => result.current.renewInvitationCode());

            expect(gateway.calls).toEqual([
                { operation: 'renewInvitationCode' },
            ]);
            expect(events).toEqual(['renew:CONFLICT']);
        });
    });

    describe('Scenario: the creation is refused', () => {
        it('reports it to the create callback', async () => {
            const gateway = new FakePairingCommandGateway();
            gateway.givenOutcome(fail(REFUSAL));
            const { result, events } = renderCommands(gateway);

            await act(async () => result.current.createCouple());

            expect(events).toEqual(['create:CONFLICT']);
        });
    });
});
