import { AgendaCoupleGuardService } from '../../application/services/agenda-couple-guard.service';
import { CreateCalendarEventUseCase } from '../../application/use-cases/create-calendar-event.use-case';
import { DeleteCalendarEventUseCase } from '../../application/use-cases/delete-calendar-event.use-case';
import { EditCalendarEventUseCase } from '../../application/use-cases/edit-calendar-event.use-case';
import { GetCalendarEventUseCase } from '../../application/use-cases/get-calendar-event.use-case';
import { ListCalendarEventsUseCase } from '../../application/use-cases/list-calendar-events.use-case';
import { MakeCalendarEventPrivateUseCase } from '../../application/use-cases/make-calendar-event-private.use-case';
import { ShareCalendarEventUseCase } from '../../application/use-cases/share-calendar-event.use-case';
import { AgendaTestFakes } from './agenda-test.fakes';

// Wires the use cases as the API does; configures the process-wide UUID generator: call `CalendarEventId.resetForTests()` in afterEach.
export class AgendaTestContext extends AgendaTestFakes {
    agendaCoupleGuardService(): AgendaCoupleGuardService {
        return new AgendaCoupleGuardService(this.pairedCoupleProvider);
    }

    createCalendarEventUseCase(): CreateCalendarEventUseCase {
        return new CreateCalendarEventUseCase(
            this.calendarEventRepository,
            this.dateTimeProvider,
            this.eventPublishingService,
        );
    }

    listCalendarEventsUseCase(): ListCalendarEventsUseCase {
        return new ListCalendarEventsUseCase(this.calendarEventRepository);
    }

    getCalendarEventUseCase(): GetCalendarEventUseCase {
        return new GetCalendarEventUseCase(this.preconditions);
    }

    editCalendarEventUseCase(): EditCalendarEventUseCase {
        return new EditCalendarEventUseCase(...this.mutationDependencies());
    }

    shareCalendarEventUseCase(): ShareCalendarEventUseCase {
        return new ShareCalendarEventUseCase(...this.mutationDependencies());
    }

    makeCalendarEventPrivateUseCase(): MakeCalendarEventPrivateUseCase {
        return new MakeCalendarEventPrivateUseCase(
            ...this.mutationDependencies(),
        );
    }

    deleteCalendarEventUseCase(): DeleteCalendarEventUseCase {
        return new DeleteCalendarEventUseCase(...this.mutationDependencies());
    }

    private mutationDependencies() {
        return [
            this.calendarEventRepository,
            this.preconditions,
            this.dateTimeProvider,
            this.eventPublishingService,
        ] as const;
    }
}
