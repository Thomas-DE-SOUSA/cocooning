import { AsyncLocalStorage } from 'node:async_hooks';

type RequestContextStore = {
    readonly requestId: string;
};

export const requestContext = new AsyncLocalStorage<RequestContextStore>();

export function getRequestId(): string | null {
    const store = requestContext.getStore();
    return store === undefined ? null : store.requestId;
}
