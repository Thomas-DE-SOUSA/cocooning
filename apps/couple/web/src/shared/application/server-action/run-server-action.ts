import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import { fail, type Result } from '@cocooning/shared-kernel/utils';
import { unstable_isUnrecognizedActionError } from 'next/navigation';

export type ServerAction<T> = () => Promise<Result<T, ApiError>>;

export type StaleDeployment = {
    readonly isStale: (error: unknown) => boolean;
    readonly reload: () => void;
};

const BROWSER_PAGE: StaleDeployment = {
    isStale: unstable_isUnrecognizedActionError,
    reload: () => window.location.reload(),
};

// Decision 0035: a rejected action becomes NETWORK_ERROR. A page older than the deployment knows action ids the server no
// longer has: retrying never helps, so the page reloads on the new version.
export async function runServerAction<T>(
    action: ServerAction<T>,
    unreachable: ApiError,
    staleDeployment: StaleDeployment = BROWSER_PAGE,
): Promise<Result<T, ApiError>> {
    try {
        return await action();
    } catch (error) {
        if (staleDeployment.isStale(error)) staleDeployment.reload();
        return fail(unreachable);
    }
}
