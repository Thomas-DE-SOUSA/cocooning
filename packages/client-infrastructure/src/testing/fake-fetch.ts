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
    | { readonly kind: 'network-failure'; readonly message: string };

export class FakeFetch {
    readonly calls: RecordedFetchCall[] = [];
    private outcome: FetchOutcome = { kind: 'response', status: 200, text: '' };
    private readonly originalFetch = globalThis.fetch;

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

    private async handle(
        ...[input, init]: Parameters<typeof fetch>
    ): Promise<Response> {
        this.calls.push({
            url: String(input),
            method: init?.method ?? 'GET',
            headers: { ...(init?.headers as Record<string, string>) },
            body: typeof init?.body === 'string' ? init.body : null,
        });
        if (this.outcome.kind === 'network-failure') {
            throw new TypeError(this.outcome.message);
        }
        return new Response(this.outcome.text || null, {
            status: this.outcome.status,
        });
    }
}
