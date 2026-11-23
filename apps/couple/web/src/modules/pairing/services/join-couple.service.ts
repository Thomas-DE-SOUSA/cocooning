import 'server-only';
import {
    createJoinCoupleFormSchema,
    type JoinCoupleUseCase,
} from '@cocooning/couple-client-business-logic/pairing';
import {
    type ApiError,
    ApiErrorCodeEnum,
    type Translator,
} from '@cocooning/couple-client-business-logic/shared';
import { fail, ok, type Result } from '@cocooning/shared-kernel/utils';

export type JoinCoupleContext = {
    readonly t: Translator;
    readonly joinCouple: JoinCoupleUseCase;
};

const INVALID_FORM: ApiError = {
    code: ApiErrorCodeEnum.VALIDATION_ERROR,
    message: 'Invalid join form',
    backendCode: null,
};

// core-frontend.md rule 14: a server action is a public endpoint, its input is validated again here.
export async function joinCouple(
    input: unknown,
    context: JoinCoupleContext,
): Promise<Result<null, ApiError>> {
    const form = createJoinCoupleFormSchema(context.t).safeParse(input);
    if (!form.success) return fail(INVALID_FORM);
    const couple = await context.joinCouple.execute(form.data);
    return couple.success ? ok(null) : couple;
}
