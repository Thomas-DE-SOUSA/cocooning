import type { INestApplication } from '@nestjs/common';
import { SESSION_COOKIE_NAME } from '../../../src/modules/authentication';
import { signSessionToken } from './session-token';

const SECONDS_PER_HOUR = 3_600;
const MILLISECONDS_PER_SECOND = 1_000;

export type TestResponse = {
    readonly status: number;
    readonly body: unknown;
};

async function readBody(response: Response): Promise<unknown> {
    const text = await response.text();
    return text.length === 0 ? null : (JSON.parse(text) as unknown);
}

export class TestClient {
    private constructor(
        private readonly baseUrl: string,
        private readonly sessionToken: string | null,
    ) {}

    static async for(app: INestApplication): Promise<TestClient> {
        return new TestClient(await app.getUrl(), null);
    }

    unauthenticated(): TestClient {
        return new TestClient(this.baseUrl, null);
    }

    withSessionToken(token: string): TestClient {
        return new TestClient(this.baseUrl, token);
    }

    // A session valid for an hour from the given instant, the clock the API reads.
    asPartner(userId: string, now: Date): TestClient {
        const nowSeconds = Math.floor(now.getTime() / MILLISECONDS_PER_SECOND);
        return this.withSessionToken(
            signSessionToken({
                sub: userId,
                exp: nowSeconds + SECONDS_PER_HOUR,
            }),
        );
    }

    async get(path: string): Promise<TestResponse> {
        const response = await fetch(`${this.baseUrl}${path}`, {
            headers: this.headers(),
        });
        return { status: response.status, body: await readBody(response) };
    }

    private headers(): Record<string, string> {
        if (this.sessionToken === null) return {};
        return { Cookie: `${SESSION_COOKIE_NAME}=${this.sessionToken}` };
    }
}
