import { FlashMessageId } from '../../domain/value-objects/flash-message-id.vo';
import { MessagingTestContext } from '../../__tests__/fixtures/messaging-test.context';
import { VAPID_PUBLIC_KEY } from '../../__tests__/fixtures/messaging-test.push-data';

describe('Feature: the PWA reads the public key it subscribes with', () => {
    afterEach(() => FlashMessageId.resetForTests());

    describe('Scenario: R11, before asking the phone for notifications', () => {
        it('gives the VAPID public key of the API', () => {
            const ctx = new MessagingTestContext();
            expect(ctx.getPushPublicKeyUseCase().execute()).toEqual({
                publicKey: VAPID_PUBLIC_KEY,
            });
        });
    });
});
