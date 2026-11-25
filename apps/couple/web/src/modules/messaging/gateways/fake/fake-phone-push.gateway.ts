import type { SubscribePushNotificationsRequest } from '@cocooning/couple-contract/messaging';
import {
    type PhonePermission,
    PhonePermissionEnum,
    type PhonePushState,
} from '../../view-models/push-notifications.view-model';
import { PhonePushGateway } from '../ports/phone-push.gateway';

// A supported phone, never asked, that grants the permission and subscribes, unless a scenario says otherwise.
export class FakePhonePushGateway extends PhonePushGateway {
    readonly calls: string[] = [];
    private state: PhonePushState = {
        isSupported: true,
        permission: PhonePermissionEnum.DEFAULT,
        subscription: null,
    };
    private permissionAnswer: PhonePermission = PhonePermissionEnum.GRANTED;
    private subscriptionAnswer: SubscribePushNotificationsRequest | null = null;
    private unsubscribeAnswer = true;

    givenState(state: PhonePushState): void {
        this.state = state;
    }

    givenPermissionAnswer(permission: PhonePermission): void {
        this.permissionAnswer = permission;
    }

    givenSubscription(
        subscription: SubscribePushNotificationsRequest | null,
    ): void {
        this.subscriptionAnswer = subscription;
    }

    givenUnsubscribeRefused(): void {
        this.unsubscribeAnswer = false;
    }

    override readState(): Promise<PhonePushState> {
        this.calls.push('readState');
        return Promise.resolve(this.state);
    }

    override requestPermission(): Promise<PhonePermission> {
        this.calls.push('requestPermission');
        return Promise.resolve(this.permissionAnswer);
    }

    override subscribe(
        publicKey: string,
    ): Promise<SubscribePushNotificationsRequest | null> {
        this.calls.push(`subscribe:${publicKey}`);
        return Promise.resolve(this.subscriptionAnswer);
    }

    override unsubscribe(): Promise<boolean> {
        this.calls.push('unsubscribe');
        return Promise.resolve(this.unsubscribeAnswer);
    }
}
