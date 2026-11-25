import type { FactoryProvider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PushNotificationSender } from '@cocooning/couple-server-business-logic/messaging';
import { Logger } from '@cocooning/shared-kernel/ports';
import type { Environment } from '../../../../env';
import { WebPushNotificationSender } from './web-push-notification-sender';

// The VAPID keys are read here only: the private key never leaves the API (core.md rule 29).
export const webPushNotificationSenderProvider: FactoryProvider<PushNotificationSender> =
    {
        provide: PushNotificationSender,
        inject: [ConfigService, Logger],
        useFactory: (
            config: ConfigService<Environment, true>,
            logger: Logger,
        ) =>
            new WebPushNotificationSender(
                {
                    subject: config.getOrThrow('WEB_PUSH_VAPID_SUBJECT', {
                        infer: true,
                    }),
                    publicKey: config.getOrThrow('WEB_PUSH_VAPID_PUBLIC_KEY', {
                        infer: true,
                    }),
                    privateKey: config.getOrThrow(
                        'WEB_PUSH_VAPID_PRIVATE_KEY',
                        {
                            infer: true,
                        },
                    ),
                },
                logger,
            ),
    };
