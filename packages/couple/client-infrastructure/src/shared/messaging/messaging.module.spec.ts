import { FakeFetch } from '@cocooning/client-infrastructure/testing';
import {
    A_MESSAGE_FEED_PAGE,
    A_PUSH_PUBLIC_KEY,
    AN_INSTANT_PHOTO,
    AN_INSTANT_PHOTO_UPLOAD,
} from '@cocooning/couple-client-business-logic/testing';
import { ok } from '@cocooning/shared-kernel/utils';
import { createMessagingModule } from './messaging.module';

describe('Feature: the web app builds the messaging use cases', () => {
    let fakeFetch: FakeFetch;

    beforeEach(() => {
        fakeFetch = new FakeFetch();
        fakeFetch.install();
    });
    afterEach(() => fakeFetch.restore());

    it('reads the session only when a use case runs', async () => {
        const reads: string[] = [];
        const messaging = createMessagingModule('http://api.test', 5000, () => {
            reads.push('session');
            return Promise.resolve('session-token-1');
        });
        expect(reads).toEqual([]);

        fakeFetch.givenResponse(200, JSON.stringify(A_MESSAGE_FEED_PAGE));
        await messaging.listMessageFeed.execute({ cursor: null, limit: 25 });

        expect(reads).toEqual(['session']);
    });

    it('wires each use case to the API', async () => {
        const messaging = createMessagingModule('http://api.test', 5000, () =>
            Promise.resolve('session-token-1'),
        );

        fakeFetch.givenResponse(201, JSON.stringify(AN_INSTANT_PHOTO));
        await expect(
            messaging.sendInstantPhoto.execute(AN_INSTANT_PHOTO_UPLOAD),
        ).resolves.toEqual(ok(AN_INSTANT_PHOTO));
        fakeFetch.givenResponse(200, JSON.stringify(A_PUSH_PUBLIC_KEY));
        await expect(messaging.getPushPublicKey.execute()).resolves.toEqual(
            ok(A_PUSH_PUBLIC_KEY),
        );

        expect(fakeFetch.calls.map(({ url }) => url)).toEqual([
            'http://api.test/instant-photos',
            'http://api.test/push-subscriptions/public-key',
        ]);
    });
});
