import { DomainEventBase } from '@cocooning/shared-kernel/domain';
import {
    type PairingEventParams,
    toDomainEventParams,
} from './pairing-event-params';

// The days stay out of the event: the couple's content is sensitive (core.md rule 33).
export type TogetherPeriodsRecordedData = {
    readonly periodCount: number;
};

export class TogetherPeriodsRecordedEvent extends DomainEventBase<TogetherPeriodsRecordedData> {
    static readonly EVENT_NAME = 'pairing.together-periods.recorded' as const;

    constructor(params: PairingEventParams<TogetherPeriodsRecordedData>) {
        super(
            toDomainEventParams(
                TogetherPeriodsRecordedEvent.EVENT_NAME,
                params,
            ),
        );
    }
}
