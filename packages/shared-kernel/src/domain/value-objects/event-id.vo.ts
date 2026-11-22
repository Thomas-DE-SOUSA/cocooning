import { Uuid } from './uuid';

export class EventId extends Uuid {
    static generate(): EventId {
        return new EventId(Uuid.generateValue());
    }

    static from(value: string): EventId {
        return new EventId(value);
    }
}
