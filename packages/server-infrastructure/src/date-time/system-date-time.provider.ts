import { DateTimeProvider } from '@cocooning/shared-kernel/ports';

export class SystemDateTimeProvider extends DateTimeProvider {
    override now(): Date {
        return new Date();
    }
}
