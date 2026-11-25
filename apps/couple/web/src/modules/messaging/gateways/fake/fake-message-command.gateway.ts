import type { FlashMessageForm } from '@cocooning/couple-client-business-logic/messaging';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import { ok, type Result } from '@cocooning/shared-kernel/utils';
import { MessageCommandGateway } from '../ports/message-command.gateway';
import type { MessageCommandCall } from './message-command-call';

type Outcome = Result<null, ApiError>;

export class FakeMessageCommandGateway extends MessageCommandGateway {
    private readonly outcomes = new Map<
        MessageCommandCall['operation'],
        Outcome
    >();
    private readonly recordedCalls: MessageCommandCall[] = [];

    get calls(): readonly MessageCommandCall[] {
        return [...this.recordedCalls];
    }

    // Every operation answers ok(null) unless a scenario gives it another outcome.
    givenOutcome(
        operation: MessageCommandCall['operation'],
        outcome: Outcome,
    ): void {
        this.outcomes.set(operation, outcome);
    }

    override sendFlashMessage(form: FlashMessageForm): Promise<Outcome> {
        return this.answer({ operation: 'sendFlashMessage', form });
    }

    override withdrawFlashMessage(id: string): Promise<Outcome> {
        return this.answer({ operation: 'withdrawFlashMessage', id });
    }

    override sendInstantPhoto(photo: File): Promise<Outcome> {
        return this.answer({
            operation: 'sendInstantPhoto',
            fileName: photo.name,
        });
    }

    override answerPhotoPrompt(
        photoPromptId: string,
        photo: File,
    ): Promise<Outcome> {
        return this.answer({
            operation: 'answerPhotoPrompt',
            photoPromptId,
            fileName: photo.name,
        });
    }

    override withdrawInstantPhoto(id: string): Promise<Outcome> {
        return this.answer({ operation: 'withdrawInstantPhoto', id });
    }

    private answer(call: MessageCommandCall): Promise<Outcome> {
        this.recordedCalls.push(call);
        return Promise.resolve(this.outcomes.get(call.operation) ?? ok(null));
    }
}
