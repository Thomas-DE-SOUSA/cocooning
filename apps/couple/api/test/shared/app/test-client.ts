import type { INestApplication } from '@nestjs/common';
import { SESSION_COOKIE_NAME } from '@cocooning/couple-contract/authentication';
import { partnerSessionToken } from './session-token';

const JSON_CONTENT_TYPE = 'application/json';

export type TestResponse = {
    readonly status: number;
    readonly body: unknown;
};

export type TestFileResponse = {
    readonly status: number;
    readonly contentType: string | null;
    readonly bytes: Uint8Array;
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

    asPartner(userId: string, now: Date): TestClient {
        return this.withSessionToken(partnerSessionToken(userId, now));
    }

    async get(path: string): Promise<TestResponse> {
        const response = await fetch(`${this.baseUrl}${path}`, {
            headers: this.headers(),
        });
        return { status: response.status, body: await readBody(response) };
    }

    async post(path: string, body: unknown = null): Promise<TestResponse> {
        const response = await fetch(`${this.baseUrl}${path}`, {
            method: 'POST',
            headers: { ...this.headers(), 'Content-Type': JSON_CONTENT_TYPE },
            body: body === null ? null : JSON.stringify(body),
        });
        return { status: response.status, body: await readBody(response) };
    }

    // multipart/form-data: fetch writes the boundary of the form itself.
    async postForm(path: string, form: FormData): Promise<TestResponse> {
        const response = await fetch(`${this.baseUrl}${path}`, {
            method: 'POST',
            headers: this.headers(),
            body: form,
        });
        return { status: response.status, body: await readBody(response) };
    }

    async getFile(path: string): Promise<TestFileResponse> {
        const response = await fetch(`${this.baseUrl}${path}`, {
            headers: this.headers(),
        });
        return {
            status: response.status,
            contentType: response.headers.get('content-type'),
            bytes: new Uint8Array(await response.arrayBuffer()),
        };
    }

    async patch(path: string, body: unknown): Promise<TestResponse> {
        const response = await fetch(`${this.baseUrl}${path}`, {
            method: 'PATCH',
            headers: { ...this.headers(), 'Content-Type': JSON_CONTENT_TYPE },
            body: JSON.stringify(body),
        });
        return { status: response.status, body: await readBody(response) };
    }

    async delete(path: string): Promise<TestResponse> {
        const response = await fetch(`${this.baseUrl}${path}`, {
            method: 'DELETE',
            headers: this.headers(),
        });
        return { status: response.status, body: await readBody(response) };
    }

    private headers(): Record<string, string> {
        if (this.sessionToken === null) return {};
        return { Cookie: `${SESSION_COOKIE_NAME}=${this.sessionToken}` };
    }
}
