import {
    type PhonePushState,
    PhonePermissionEnum,
    type PushNotificationsStatus,
    PushNotificationsStatusEnum,
} from '../view-models/push-notifications.view-model';

// R11: a phone without push support cannot subscribe; a refused permission is changed in the phone settings only.
export function presentPushNotificationsStatus(
    state: PhonePushState | null,
): PushNotificationsStatus {
    if (state === null) return PushNotificationsStatusEnum.CHECKING;
    if (!state.isSupported) return PushNotificationsStatusEnum.UNSUPPORTED;
    if (state.permission === PhonePermissionEnum.DENIED) {
        return PushNotificationsStatusEnum.BLOCKED;
    }
    const isOn =
        state.permission === PhonePermissionEnum.GRANTED &&
        state.subscription !== null;
    return isOn
        ? PushNotificationsStatusEnum.ON
        : PushNotificationsStatusEnum.OFF;
}
