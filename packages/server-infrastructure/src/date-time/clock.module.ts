import { Global, Module } from '@nestjs/common';
import { DateTimeProvider } from '@cocooning/shared-kernel/ports';
import { SystemDateTimeProvider } from './system-date-time.provider';

@Global()
@Module({
    providers: [
        { provide: DateTimeProvider, useClass: SystemDateTimeProvider },
    ],
    exports: [DateTimeProvider],
})
export class ClockModule {}
