import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import { fail, ok } from '@cocooning/shared-kernel/utils';
import { runServerAction, type StaleDeployment } from './run-server-action';

const UNREACHABLE: ApiError = {
    code: ApiErrorCodeEnum.NETWORK_ERROR,
    message: 'Server action unreachable',
    backendCode: null,
};

class UnknownActionError extends Error {}

function aStaleDeployment(reloads: string[]): StaleDeployment {
    return {
        isStale: (error) => error instanceof UnknownActionError,
        reload: () => reloads.push('reload'),
    };
}

describe('Feature: a server action called from the phone', () => {
    it('gives the result of the action', async () => {
        await expect(
            runServerAction(() => Promise.resolve(ok(null)), UNREACHABLE),
        ).resolves.toEqual(ok(null));
    });

    it('gives a network error when the phone cannot reach the server, without reloading', async () => {
        const reloads: string[] = [];
        const result = await runServerAction(
            () => Promise.reject(new TypeError('Failed to fetch')),
            UNREACHABLE,
            aStaleDeployment(reloads),
        );

        expect(result).toEqual(fail(UNREACHABLE));
        expect(reloads).toEqual([]);
    });

    it('reloads a page older than the deployment, whose action is unknown', async () => {
        const reloads: string[] = [];
        const result = await runServerAction(
            () => Promise.reject(new UnknownActionError()),
            UNREACHABLE,
            aStaleDeployment(reloads),
        );

        expect(result).toEqual(fail(UNREACHABLE));
        expect(reloads).toEqual(['reload']);
    });
});
