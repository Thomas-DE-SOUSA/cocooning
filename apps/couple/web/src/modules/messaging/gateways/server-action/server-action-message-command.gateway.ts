import type { FlashMessageForm } from '@cocooning/couple-client-business-logic/messaging';
import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import { INSTANT_PHOTO_FORM_FIELD } from '@cocooning/couple-contract/messaging';
import type { Result } from '@cocooning/shared-kernel/utils';
import { runServerAction } from '@/shared/application/server-action/run-server-action';
import type { FlashMessageFormInput } from '../../view-models/flash-message-form.view-model';
import { MessageCommandGateway } from '../ports/message-command.gateway';

type CommandResult = Promise<Result<null, ApiError>>;

export type MessageCommandActions = {
    readonly sendFlashMessage: (input: FlashMessageFormInput) => CommandResult;
    readonly withdrawFlashMessage: (flashMessageId: string) => CommandResult;
    readonly sendInstantPhoto: (form: FormData) => CommandResult;
    readonly answerPhotoPrompt: (
        photoPromptId: string,
        form: FormData,
    ) => CommandResult;
    readonly withdrawInstantPhoto: (instantPhotoId: string) => CommandResult;
};

const UNREACHABLE: ApiError = {
    code: ApiErrorCodeEnum.NETWORK_ERROR,
    message: 'Messaging server action unreachable',
    backendCode: null,
};

const photoForm = (photo: File): FormData => {
    const form = new FormData();
    form.append(INSTANT_PHOTO_FORM_FIELD, photo);
    return form;
};

// Every call goes through runServerAction: a rejected action becomes NETWORK_ERROR (decision 0035).
export class ServerActionMessageCommandGateway extends MessageCommandGateway {
    constructor(private readonly actions: MessageCommandActions) {
        super();
    }

    override sendFlashMessage(form: FlashMessageForm): CommandResult {
        return this.run(() =>
            this.actions.sendFlashMessage({ text: form.text }),
        );
    }

    override withdrawFlashMessage(flashMessageId: string): CommandResult {
        return this.run(() =>
            this.actions.withdrawFlashMessage(flashMessageId),
        );
    }

    override sendInstantPhoto(photo: File): CommandResult {
        return this.run(() => this.actions.sendInstantPhoto(photoForm(photo)));
    }

    override answerPhotoPrompt(
        photoPromptId: string,
        photo: File,
    ): CommandResult {
        return this.run(() =>
            this.actions.answerPhotoPrompt(photoPromptId, photoForm(photo)),
        );
    }

    override withdrawInstantPhoto(instantPhotoId: string): CommandResult {
        return this.run(() =>
            this.actions.withdrawInstantPhoto(instantPhotoId),
        );
    }

    private run(action: () => CommandResult): CommandResult {
        return runServerAction(action, UNREACHABLE);
    }
}
