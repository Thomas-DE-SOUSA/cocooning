import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import type { OutboxEvent } from '../../domain/models/outbox-event';

export const PHONE_OF_A = 'https://push.example.test/send/phone-of-a';
export const PHONE_OF_B = 'https://push.example.test/send/phone-of-b';
export const TABLET_OF_B = 'https://push.example.test/send/tablet-of-b';
export const PHONE_OF_STRANGER = 'https://push.example.test/send/stranger';
export const P256DH = `B${'p'.repeat(86)}`;
export const AUTH = 'aaaaaaaaaaaaaaaaaaaaaa';
export const RENEWED_P256DH = `B${'r'.repeat(86)}`;
export const RENEWED_AUTH = 'rrrrrrrrrrrrrrrrrrrrrr';
export const VAPID_PUBLIC_KEY = `B${'v'.repeat(86)}`;
export const RELAY_BATCH_SIZE = 3;

// A row of an outbox as the relay reads it, its id numbered by the spec.
export const outboxEventOf = (
    eventNumber: number,
    eventName: string,
    context: ExecutionContext,
    data: unknown = null,
): OutboxEvent => ({
    eventId: `e0000000-0000-7000-8000-${String(eventNumber).padStart(12, '0')}`,
    coupleId: context.coupleId,
    userId: context.userId,
    eventName,
    data,
});
