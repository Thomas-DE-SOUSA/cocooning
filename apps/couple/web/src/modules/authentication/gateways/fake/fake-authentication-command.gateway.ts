import type { SignInForm } from '@cocooning/couple-client-business-logic/authentication';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import { ok, type Result } from '@cocooning/shared-kernel/utils';
import { AuthenticationCommandGateway } from '../ports/authentication-command.gateway';
import type { AuthenticationCommandCall } from './authentication-command-call';

export class FakeAuthenticationCommandGateway extends AuthenticationCommandGateway {
    private signInOutcome: Result<null, ApiError> = ok(null);
    private signOutOutcome: Result<null, ApiError> = ok(null);
    private readonly recordedCalls: AuthenticationCommandCall[] = [];

    get calls(): readonly AuthenticationCommandCall[] {
        return [...this.recordedCalls];
    }

    givenSignInOutcome(outcome: Result<null, ApiError>): void {
        this.signInOutcome = outcome;
    }

    givenSignOutOutcome(outcome: Result<null, ApiError>): void {
        this.signOutOutcome = outcome;
    }

    override signIn(form: SignInForm): Promise<Result<null, ApiError>> {
        this.recordedCalls.push({ operation: 'signIn', form });
        return Promise.resolve(this.signInOutcome);
    }

    override signOut(): Promise<Result<null, ApiError>> {
        this.recordedCalls.push({ operation: 'signOut' });
        return Promise.resolve(this.signOutOutcome);
    }
}
