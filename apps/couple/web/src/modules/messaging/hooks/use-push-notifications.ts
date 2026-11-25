import { useCallback, useEffect, useState } from 'react';
import { presentPushNotificationsStatus } from '../presenters/push-notifications-status.presenter';
import {
    type PushNotificationsSwitch,
    turnOffPushNotifications,
    turnOnPushNotifications,
} from '../services/push-notifications-switch.service';
import type { PhonePushState } from '../view-models/push-notifications.view-model';

type Turn = typeof turnOnPushNotifications;

// R11: the phone is read after hydration (the server knows nothing of it), then each tap turns its notifications.
export function usePushNotifications(options: PushNotificationsSwitch) {
    const { phone } = options;
    const [state, setState] = useState<PhonePushState | null>(null);
    const [isPending, setIsPending] = useState(false);

    useEffect(() => {
        let isCurrent = true;
        void phone.readState().then((read) => {
            if (isCurrent) setState(read);
        });
        return () => {
            isCurrent = false;
        };
    }, [phone]);

    const run = useCallback(
        async (turn: Turn) => {
            if (state === null || isPending) return;
            setIsPending(true);
            setState(await turn(options, state));
            setIsPending(false);
        },
        [options, state, isPending],
    );

    return {
        status: presentPushNotificationsStatus(state),
        isPending,
        turnOn: useCallback(() => run(turnOnPushNotifications), [run]),
        turnOff: useCallback(() => run(turnOffPushNotifications), [run]),
    };
}
