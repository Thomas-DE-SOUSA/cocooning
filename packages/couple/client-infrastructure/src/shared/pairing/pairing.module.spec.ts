import { FakeFetch } from '@cocooning/client-infrastructure/testing';
import { A_PENDING_COUPLE } from '@cocooning/couple-client-business-logic/testing';
import { createPairingModule } from './pairing.module';

describe('Feature: the web app builds the pairing use cases', () => {
    let fakeFetch: FakeFetch;

    beforeEach(() => {
        fakeFetch = new FakeFetch();
        fakeFetch.install();
    });
    afterEach(() => fakeFetch.restore());

    it('reads the session only when a use case runs', async () => {
        const reads: string[] = [];
        const pairing = createPairingModule('http://api.test', 5000, () => {
            reads.push('session');
            return Promise.resolve('session-token-1');
        });
        expect(reads).toEqual([]);

        fakeFetch.givenResponse(200, JSON.stringify(A_PENDING_COUPLE));
        await pairing.getMyCouple.execute();
        await pairing.createCouple.execute();
        await pairing.renewInvitationCode.execute();
        await pairing.joinCouple.execute({ invitationCode: 'K7M2Q9XR' });
        await pairing.cancelCouple.execute();

        expect(reads).toEqual([
            'session',
            'session',
            'session',
            'session',
            'session',
        ]);
        expect(fakeFetch.calls.map((call) => call.url)).toEqual([
            'http://api.test/pairing/couple',
            'http://api.test/pairing/couple',
            'http://api.test/pairing/couple/invitation-code',
            'http://api.test/pairing/couple/join',
            'http://api.test/pairing/couple',
        ]);
    });
});
