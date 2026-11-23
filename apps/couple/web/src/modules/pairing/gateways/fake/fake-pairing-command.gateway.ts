import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import { ok, type Result } from '@cocooning/shared-kernel/utils';
import { PairingCommandGateway } from '../ports/pairing-command.gateway';
import type { PairingCommandCall } from './pairing-command-call';

export class FakePairingCommandGateway extends PairingCommandGateway {
    private outcome: Result<null, ApiError> = ok(null);
    private readonly recordedCalls: PairingCommandCall[] = [];

    get calls(): readonly PairingCommandCall[] {
        return [...this.recordedCalls];
    }

    givenOutcome(outcome: Result<null, ApiError>): void {
        this.outcome = outcome;
    }

    override createCouple(): Promise<Result<null, ApiError>> {
        return this.answer({ operation: 'createCouple' });
    }

    override renewInvitationCode(): Promise<Result<null, ApiError>> {
        return this.answer({ operation: 'renewInvitationCode' });
    }

    private answer(call: PairingCommandCall): Promise<Result<null, ApiError>> {
        this.recordedCalls.push(call);
        return Promise.resolve(this.outcome);
    }
}
