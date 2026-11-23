import { FakeFetch } from '@cocooning/client-infrastructure/testing';
import {
    SignInUseCase,
    SignOutUseCase,
} from '@cocooning/couple-client-business-logic/authentication';
import { createAuthenticationModule } from './authentication.module';

describe('Feature: the web app builds the authentication use cases', () => {
    let fakeFetch: FakeFetch;

    beforeEach(() => {
        fakeFetch = new FakeFetch();
        fakeFetch.install();
    });
    afterEach(() => fakeFetch.restore());

    it('wires sign-in to the API at the configured address', async () => {
        const { signIn } = createAuthenticationModule(
            'http://api.test',
            5000,
            () => Promise.resolve(null),
        );
        await signIn.execute({
            emailAddress: 'thomas@cocooning.test',
            password: 'secret',
        });
        expect(signIn).toBeInstanceOf(SignInUseCase);
        expect(fakeFetch.calls.map((call) => call.url)).toEqual([
            'http://api.test/authentication/session',
        ]);
    });

    it('wires sign-out to the API with the session of the partner', async () => {
        const { signOut } = createAuthenticationModule(
            'http://api.test',
            5000,
            () => Promise.resolve('session-token-1'),
        );
        fakeFetch.givenResponse(204, '');
        await signOut.execute();
        expect(signOut).toBeInstanceOf(SignOutUseCase);
        expect(fakeFetch.calls).toEqual([
            {
                url: 'http://api.test/authentication/session',
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    Cookie: 'cocooning_session=session-token-1',
                },
                body: null,
            },
        ]);
    });
});
