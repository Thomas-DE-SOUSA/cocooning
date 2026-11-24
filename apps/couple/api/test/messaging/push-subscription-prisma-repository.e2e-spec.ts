import { MessagingExceptionCodeEnum } from '@cocooning/couple-contract/messaging';
import {
    PushEndpoint,
    PushSubscription,
    PushSubscriptionKeys,
    PushSubscriptionRepository,
} from '@cocooning/couple-server-business-logic/messaging';
import { MessagingTestApp } from './messaging-test-app';
import {
    COUPLE_ID,
    NOW,
    OTHER_COUPLE_ID,
    PARTNER_A,
    PARTNER_B,
    STRANGER,
} from './messaging-test-data';
import { PHONE_OF_A, PHONE_OF_STRANGER, PUSH_KEYS } from './push-test-data';

const subscriptionOf = (
    coupleId: string,
    ownerId: string,
    endpoint: string,
): PushSubscription =>
    PushSubscription.subscribe(
        {
            coupleId,
            ownerId,
            endpoint: PushEndpoint.create(endpoint),
            keys: PushSubscriptionKeys.create(PUSH_KEYS),
        },
        NOW,
    );

describe('Feature: the Prisma adapter of the push subscriptions', () => {
    const messaging = new MessagingTestApp();
    let repository: PushSubscriptionRepository;
    let ofA: PushSubscription;
    let ofStranger: PushSubscription;

    beforeAll(async () => {
        await messaging.start();
        repository = messaging.get(PushSubscriptionRepository);
    });
    afterAll(() => messaging.stop());
    beforeEach(async () => {
        await messaging.reset();
        ofA = subscriptionOf(COUPLE_ID, PARTNER_A, PHONE_OF_A);
        ofStranger = subscriptionOf(
            OTHER_COUPLE_ID,
            STRANGER,
            PHONE_OF_STRANGER,
        );
        await repository.save(ofA);
        await repository.save(ofStranger);
    });

    const endpointsOf = async (coupleIds: string[]) =>
        (await repository.findOfCouples(coupleIds)).map(
            (s) => s.endpoint.value,
        );

    it('reads the subscriptions of the given couples only (core.md rule 27)', async () => {
        expect(await endpointsOf([COUPLE_ID])).toEqual([PHONE_OF_A]);
        expect(
            await repository.findByEndpoint(OTHER_COUPLE_ID, PHONE_OF_A),
        ).toBeNull();
        expect(
            await repository.findOfOwner(COUPLE_ID, PARTNER_B, PHONE_OF_A),
        ).toBeNull();
    });

    it('rebuilds the stored subscription as saved', async () => {
        const found = await repository.findOfOwner(
            COUPLE_ID,
            PARTNER_A,
            PHONE_OF_A,
        );
        expect(found?.toSnapshot()).toEqual(ofA.toSnapshot());
    });

    it('forgets a subscription only within its own couple', async () => {
        const forged = PushSubscription.fromSnapshot({
            ...ofStranger.toSnapshot(),
            coupleId: COUPLE_ID,
        });
        await repository.forget([forged]);
        expect(await endpointsOf([OTHER_COUPLE_ID])).toEqual([
            PHONE_OF_STRANGER,
        ]);
        await repository.forget([ofA, ofStranger]);
        expect(await endpointsOf([COUPLE_ID, OTHER_COUPLE_ID])).toEqual([]);
    });

    it('answers a version conflict for a stale save', async () => {
        const stale = PushSubscription.fromSnapshot(ofA.toSnapshot());
        const fresh = PushSubscription.fromSnapshot(ofA.toSnapshot());
        fresh.renewFor(PARTNER_B, fresh.keys, NOW);
        await repository.save(fresh);
        stale.renewFor(PARTNER_A, stale.keys, NOW);
        await expect(repository.save(stale)).rejects.toMatchObject({
            code: MessagingExceptionCodeEnum.PUSH_SUBSCRIPTION_VERSION_CONFLICT,
        });
    });

    it('answers a version conflict for a second subscription of the same phone (unique couple_id, endpoint)', async () => {
        await expect(
            repository.save(subscriptionOf(COUPLE_ID, PARTNER_B, PHONE_OF_A)),
        ).rejects.toMatchObject({
            code: MessagingExceptionCodeEnum.PUSH_SUBSCRIPTION_VERSION_CONFLICT,
        });
    });
});
