export type RecordedFetchCall = {
    readonly url: string;
    readonly method: string;
    readonly headers: Readonly<Record<string, string>>;
    readonly body: string | null;
};

type FetchOutcome =
    | {
          readonly kind: 'response';
          readonly status: number;
          readonly text: string;
      }
    | { readonly kind: 'network-failure'; readonly message: string }
    | { readonly kind: 'no-answer' };

export class FakeFetch {
    private readonly recordedCalls: RecordedFetchCall[] = [];
    private outcome: FetchOutcome = { kind: 'response', status: 200, text: '' };
    private readonly originalFetch = globalThis.fetch;

    get calls(): ReadonlyArray<RecordedFetchCall> {
        return [...this.recordedCalls];
    }

    install(): void {
        globalThis.fetch = (...args) => this.handle(...args);
    }

    restore(): void {
        globalThis.fetch = this.originalFetch;
    }

    givenResponse(status: number, text: string): void {
        this.outcome = { kind: 'response', status, text };
    }

    givenNetworkFailure(message: string): void {
        this.outcome = { kind: 'network-failure', message };
    }

    // An API that never answers: the request rejects only when its signal aborts, as fetch does.
    givenNoAnswer(): void {
        this.outcome = { kind: 'no-answer' };
    }

    private async handle(
        ...[input, init]: Parameters<typeof fetch>
    ): Promise<Response> {
        this.recordedCalls.push({
            url: String(input),
            method: init?.method ?? 'GET',
            headers: { ...(init?.headers as Record<string, string>) },
            body: typeof init?.body === 'string' ? init.body : null,
        });
        if (this.outcome.kind === 'network-failure') {
            throw new TypeError(this.outcome.message);
        }
        if (this.outcome.kind === 'no-answer') return waitForAbort(init);
        return new Response(this.outcome.text || null, {
            status: this.outcome.status,
        });
    }
}

function waitForAbort(init: RequestInit | undefined): Promise<Response> {
    return new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () =>
            reject(init.signal?.reason),
        );
    });
}
