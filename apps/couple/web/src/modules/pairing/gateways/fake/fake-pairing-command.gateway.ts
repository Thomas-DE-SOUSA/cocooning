import type { JoinCoupleForm } from '@cocooning/couple-client-business-logic/pairing';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import { ok, type Result } from '@cocooning/shared-kernel/utils';
import { PairingCommandGateway } from '../ports/pairing-command.gateway';
import type { PairingCommandCall } from './pairing-command-call';

export class FakePairingCommandGateway extends PairingCommandGateway {
    private outcome: Result<null, ApiError> = ok(null);
    private readonly recordedCalls: PairingCommandCall[] = [];
    private held: Promise<void> | null = null;

    get calls(): readonly PairingCommandCall[] {
        return [...this.recordedCalls];
    }

    givenOutcome(outcome: Result<null, ApiError>): void {
        this.outcome = outcome;
    }

    // The next answers wait until the returned release is called: the spec sees the command still running.
    holdAnswers(): () => void {
        let release: () => void = () => {};
        this.held = new Promise((resolve) => {
            release = resolve;
        });
        return release;
    }

    override createCouple(): Promise<Result<null, ApiError>> {
        return this.answer({ operation: 'createCouple' });
    }

    override joinCouple(form: JoinCoupleForm): Promise<Result<null, ApiError>> {
        return this.answer({ operation: 'joinCouple', form });
    }

    override renewInvitationCode(): Promise<Result<null, ApiError>> {
        return this.answer({ operation: 'renewInvitationCode' });
    }

    override cancelCouple(): Promise<Result<null, ApiError>> {
        return this.answer({ operation: 'cancelCouple' });
    }

    private async answer(
        call: PairingCommandCall,
    ): Promise<Result<null, ApiError>> {
        this.recordedCalls.push(call);
        await this.held;
        return this.outcome;
    }
}
