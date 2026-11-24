import { Module } from '@nestjs/common';
import { AgendaServiceModule } from './agenda-service.module';
import { AgendaCoupleGuard } from './primary/couple';
import {
    CreateCalendarEventController,
    DeleteCalendarEventController,
    EditCalendarEventController,
    GetCalendarEventController,
    ListCalendarEventsController,
    MakeCalendarEventPrivateController,
    ShareCalendarEventController,
} from './primary/controllers';

@Module({
    imports: [AgendaServiceModule],
    controllers: [
        CreateCalendarEventController,
        ListCalendarEventsController,
        GetCalendarEventController,
        EditCalendarEventController,
        ShareCalendarEventController,
        MakeCalendarEventPrivateController,
        DeleteCalendarEventController,
    ],
    providers: [AgendaCoupleGuard],
})
export class AgendaModule {}
