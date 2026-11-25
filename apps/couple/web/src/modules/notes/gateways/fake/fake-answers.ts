import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import { ok, type Result } from '@cocooning/shared-kernel/utils';

// The answers of a fake command gateway: its journal, one outcome for every call, and a hold to see a command running.
export class FakeAnswers<Call> {
    private outcome: Result<null, ApiError> = ok(null);
    private readonly recordedCalls: Call[] = [];
    private held: Promise<void> | null = null;

    get calls(): readonly Call[] {
        return [...this.recordedCalls];
    }

    givenOutcome(outcome: Result<null, ApiError>): void {
        this.outcome = outcome;
    }

    // The next answers wait until the returned release is called.
    holdAnswers(): () => void {
        let release: () => void = () => {};
        this.held = new Promise((resolve) => {
            release = resolve;
        });
        return release;
    }

    async answer(call: Call): Promise<Result<null, ApiError>> {
        this.recordedCalls.push(call);
        await this.held;
        return this.outcome;
    }
}
