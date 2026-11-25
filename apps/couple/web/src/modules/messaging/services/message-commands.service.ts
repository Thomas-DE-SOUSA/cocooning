import 'server-only';
import {
    createFlashMessageFormSchema,
    type SendFlashMessageUseCase,
} from '@cocooning/couple-client-business-logic/messaging';
import {
    type ApiError,
    ApiErrorCodeEnum,
    type Translator,
} from '@cocooning/couple-client-business-logic/shared';
import {
    FlashMessageParamsRequestSchema,
    InstantPhotoParamsRequestSchema,
} from '@cocooning/couple-contract/messaging';
import { fail, ok, type Result } from '@cocooning/shared-kernel/utils';

export type SendFlashMessageContext = {
    readonly t: Translator;
    readonly sendFlashMessage: SendFlashMessageUseCase;
};

export type FeedItemUseCaseCall = (
    id: string,
) => Promise<Result<unknown, ApiError>>;

export const invalidInput = (message: string): ApiError => ({
    code: ApiErrorCodeEnum.VALIDATION_ERROR,
    message,
    backendCode: null,
});

const dropValue = (
    result: Result<unknown, ApiError>,
): Result<null, ApiError> => (result.success ? ok(null) : result);

// core-frontend.md rule 14: a server action is a public endpoint, its input is validated again here (R2).
export async function sendFlashMessage(
    input: unknown,
    context: SendFlashMessageContext,
): Promise<Result<null, ApiError>> {
    const form = createFlashMessageFormSchema(context.t).safeParse(input);
    if (!form.success) return fail(invalidInput('Invalid flash message form'));
    return dropValue(await context.sendFlashMessage.execute(form.data));
}

// R6: the author withdraws a word; the API refuses the partner's.
export async function withdrawFlashMessage(
    input: unknown,
    call: FeedItemUseCaseCall,
): Promise<Result<null, ApiError>> {
    const params = FlashMessageParamsRequestSchema.safeParse({
        flashMessageId: input,
    });
    if (!params.success) return fail(invalidInput('Invalid flash message id'));
    return dropValue(await call(params.data.flashMessageId));
}

// R6: the author withdraws a photo; the API refuses the partner's.
export async function withdrawInstantPhoto(
    input: unknown,
    call: FeedItemUseCaseCall,
): Promise<Result<null, ApiError>> {
    const params = InstantPhotoParamsRequestSchema.safeParse({
        instantPhotoId: input,
    });
    if (!params.success) return fail(invalidInput('Invalid instant photo id'));
    return dropValue(await call(params.data.instantPhotoId));
}
