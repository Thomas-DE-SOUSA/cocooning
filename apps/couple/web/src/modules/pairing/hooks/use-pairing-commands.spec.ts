import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import { fail } from '@cocooning/shared-kernel/utils';
import { act, renderHook } from '@testing-library/react';
import { FakePairingCommandGateway } from '../gateways/fake/fake-pairing-command.gateway';
import { usePairingCommands } from './use-pairing-commands';

const REFUSAL: ApiError = {
    code: ApiErrorCodeEnum.VALIDATION_ERROR,
    message: 'Invitation code invalid',
    backendCode: 'PAIRING_INVITATION_CODE_INVALID',
};

function renderCommands(gateway: FakePairingCommandGateway) {
    const events: string[] = [];
    const { result } = renderHook(() =>
        usePairingCommands({
            gateway,
            onDone: () => events.push('done'),
            onFailed: (command, error) =>
                events.push(`${command}:${error.code}`),
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
            expect(result.current.pendingCommand).toBeNull();
        });
    });

    describe('Scenario: R5, the second partner joins with the code', () => {
        it('sends the form and asks for a refresh', async () => {
            const gateway = new FakePairingCommandGateway();
            const { result, events } = renderCommands(gateway);

            await act(async () =>
                result.current.joinCouple({ invitationCode: 'K7M2Q9XR' }),
            );

            expect(gateway.calls).toEqual([
                {
                    operation: 'joinCouple',
                    form: { invitationCode: 'K7M2Q9XR' },
                },
            ]);
            expect(events).toEqual(['done']);
        });

        it('reports a wrong code with its command, without refreshing (R6)', async () => {
            const gateway = new FakePairingCommandGateway();
            gateway.givenOutcome(fail(REFUSAL));
            const { result, events } = renderCommands(gateway);

            await act(async () =>
                result.current.joinCouple({ invitationCode: 'WRONG123' }),
            );

            expect(events).toEqual(['JOIN_COUPLE:VALIDATION_ERROR']);
        });
    });

    describe('Scenario: R7, the creator renews the code', () => {
        it('reports a refusal with its command', async () => {
            const gateway = new FakePairingCommandGateway();
            gateway.givenOutcome(fail(REFUSAL));
            const { result, events } = renderCommands(gateway);

            await act(async () => result.current.renewInvitationCode());

            expect(gateway.calls).toEqual([
                { operation: 'renewInvitationCode' },
            ]);
            expect(events).toEqual(['RENEW_INVITATION_CODE:VALIDATION_ERROR']);
        });
    });
});
