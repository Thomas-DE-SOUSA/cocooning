import 'server-only';
import {
    createSignInFormSchema,
    type SignInClientContext,
    type SignInUseCase,
} from '@cocooning/couple-client-business-logic/authentication';
import {
    type ApiError,
    ApiErrorCodeEnum,
    type Translator,
} from '@cocooning/couple-client-business-logic/shared';
import {
    SESSION_COOKIE_NAME,
    type SignInResponse,
} from '@cocooning/couple-contract/authentication';
import { fail, ok, type Result } from '@cocooning/shared-kernel/utils';

export type SessionCookie = {
    readonly name: string;
    readonly value: string;
    readonly options: {
        readonly httpOnly: true;
        readonly secure: boolean;
        readonly sameSite: 'lax';
        readonly path: string;
        readonly expires: Date;
    };
};

export type SignInSessionContext = {
    readonly t: Translator;
    readonly signIn: SignInUseCase;
    readonly client: SignInClientContext;
    readonly secure: boolean;
};

const ROOT_PATH = '/';

const anError = (code: ApiError['code'], message: string): ApiError => ({
    code,
    message,
    backendCode: null,
});

// core-frontend.md rule 14: a server action is a public endpoint, its input is validated again here.
export async function openSignInSession(
    input: unknown,
    context: SignInSessionContext,
): Promise<Result<SessionCookie, ApiError>> {
    const form = createSignInFormSchema(context.t).safeParse(input);
    if (!form.success) {
        return fail(
            anError(ApiErrorCodeEnum.VALIDATION_ERROR, 'Invalid sign-in form'),
        );
    }
    const session = await context.signIn.execute(form.data, context.client);
    if (!session.success) return session;
    return toSessionCookie(session.value, context.secure);
}

// Decision 0034: the token only lives in an HttpOnly cookie that expires with the session.
function toSessionCookie(
    session: SignInResponse,
    secure: boolean,
): Result<SessionCookie, ApiError> {
    const expires = new Date(session.sessionExpiresAt);
    if (Number.isNaN(expires.getTime())) {
        return fail(
            anError(
                ApiErrorCodeEnum.INVALID_RESPONSE,
                'Session expiry is not a date',
            ),
        );
    }
    return ok({
        name: SESSION_COOKIE_NAME,
        value: session.sessionToken,
        options: {
            httpOnly: true,
            secure,
            sameSite: 'lax',
            path: ROOT_PATH,
            expires,
        },
    });
}
