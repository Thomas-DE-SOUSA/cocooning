import type { SubscribePushNotificationsRequest } from '@cocooning/couple-contract/messaging';

// R11: what the card says about the notifications of this phone. CHECKING until the browser has been read.
export const PushNotificationsStatusEnum = {
    CHECKING: 'CHECKING',
    UNSUPPORTED: 'UNSUPPORTED',
    BLOCKED: 'BLOCKED',
    OFF: 'OFF',
    ON: 'ON',
} as const;

export type PushNotificationsStatus =
    (typeof PushNotificationsStatusEnum)[keyof typeof PushNotificationsStatusEnum];

// The values of the browser's Notification.permission.
export const PhonePermissionEnum = {
    DEFAULT: 'default',
    GRANTED: 'granted',
    DENIED: 'denied',
} as const satisfies Record<string, NotificationPermission>;

export type PhonePermission =
    (typeof PhonePermissionEnum)[keyof typeof PhonePermissionEnum];

// What this phone says: push support (on iPhone, only once installed on the home screen), permission, subscription.
export type PhonePushState = {
    readonly isSupported: boolean;
    readonly permission: PhonePermission;
    readonly subscription: SubscribePushNotificationsRequest | null;
};
