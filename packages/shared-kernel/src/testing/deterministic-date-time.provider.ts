import { DateTimeProvider } from '../ports/date-time/date-time.provider';

export class DeterministicDateTimeProvider extends DateTimeProvider {
    private current: Date;

    constructor(initial: Date) {
        super();
        this.current = new Date(initial.getTime());
    }

    override now(): Date {
        return new Date(this.current.getTime());
    }

    setNow(date: Date): void {
        this.current = new Date(date.getTime());
    }

    advanceBy(milliseconds: number): void {
        this.current = new Date(this.current.getTime() + milliseconds);
    }
}
