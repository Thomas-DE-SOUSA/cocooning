import { Global, Module } from '@nestjs/common';
import { EventPublisher } from '@cocooning/shared-kernel/ports';
import { InProcessEventPublisher } from './in-process-event-publisher';

@Global()
@Module({
    providers: [{ provide: EventPublisher, useClass: InProcessEventPublisher }],
    exports: [EventPublisher],
})
export class MessagingModule {}
