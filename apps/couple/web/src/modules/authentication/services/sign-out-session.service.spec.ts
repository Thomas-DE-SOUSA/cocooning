import { SignOutUseCase } from '@cocooning/couple-client-business-logic/authentication';
import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import { FakeAuthenticationGateway } from '@cocooning/couple-client-business-logic/testing';
import { SESSION_COOKIE_NAME } from '@cocooning/couple-contract/authentication';
import { fail, ok } from '@cocooning/shared-kernel/utils';
import { closeSignOutSession } from './sign-out-session.service';

const aRefusal = (code: ApiError['code']): ApiError => ({
    code,
    message: 'Refused',
    backendCode: null,
});

function signOutWith(gateway: FakeAuthenticationGateway) {
    const deleted: string[] = [];
    const run = () =>
        closeSignOutSession(new SignOutUseCase(gateway), () =>
            Promise.resolve({ delete: (name: string) => deleted.push(name) }),
        );
    return { run, deleted };
}

describe('Feature: sign out of every device (decision 0034)', () => {
    it('drops the session cookie once the API closed the sessions', async () => {
        const { run, deleted } = signOutWith(new FakeAuthenticationGateway());

        await expect(run()).resolves.toEqual(ok(null));
        expect(deleted).toEqual([SESSION_COOKIE_NAME]);
    });

    it('drops the cookie of a session the API already refuses', async () => {
        const gateway = new FakeAuthenticationGateway();
        gateway.givenSignOutRefusal(aRefusal(ApiErrorCodeEnum.UNAUTHORIZED));
        const { run, deleted } = signOutWith(gateway);

        await expect(run()).resolves.toEqual(ok(null));
        expect(deleted).toEqual([SESSION_COOKIE_NAME]);
    });

    it('keeps the cookie when the API could not close the sessions', async () => {
        const gateway = new FakeAuthenticationGateway();
        const offline = aRefusal(ApiErrorCodeEnum.NETWORK_ERROR);
        gateway.givenSignOutRefusal(offline);
        const { run, deleted } = signOutWith(gateway);

        await expect(run()).resolves.toEqual(fail(offline));
        expect(deleted).toEqual([]);
    });
});
