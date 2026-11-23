import { FakeFetch } from '@cocooning/client-infrastructure/testing';
import { SignInUseCase } from '@cocooning/couple-client-business-logic/authentication';
import { createAuthenticationModule } from './authentication.module';

describe('Feature: the web app builds the authentication use cases', () => {
    let fakeFetch: FakeFetch;

    beforeEach(() => {
        fakeFetch = new FakeFetch();
        fakeFetch.install();
    });
    afterEach(() => fakeFetch.restore());

    it('wires sign-in to the API at the configured address', async () => {
        const { signIn } = createAuthenticationModule('http://api.test', 5000);
        await signIn.execute(
            { emailAddress: 'thomas@cocooning.test', password: 'secret' },
            { ipAddress: null, userAgent: null },
        );
        expect(signIn).toBeInstanceOf(SignInUseCase);
        expect(fakeFetch.calls.map((call) => call.url)).toEqual([
            'http://api.test/authentication/session',
        ]);
    });
});
