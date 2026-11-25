import { Module } from '@nestjs/common';
import { AgendaServiceModule } from './agenda-service.module';
import { AgendaCoupleGuard } from './primary/couple';
import {
    CreateCalendarEventController,
    CreateCalendarLabelController,
    DeleteCalendarEventController,
    DeleteCalendarLabelController,
    EditCalendarEventController,
    EditCalendarLabelController,
    GetCalendarEventController,
    ListCalendarEventsController,
    ListCalendarLabelsController,
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
        ListCalendarLabelsController,
        CreateCalendarLabelController,
        EditCalendarLabelController,
        DeleteCalendarLabelController,
    ],
    providers: [AgendaCoupleGuard],
})
export class AgendaModule {}
