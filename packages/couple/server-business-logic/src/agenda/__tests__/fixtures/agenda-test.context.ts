import { AgendaCoupleGuardService } from '../../application/services/agenda-couple-guard.service';
import { CreateCalendarEventUseCase } from '../../application/use-cases/create-calendar-event.use-case';
import { CreateCalendarLabelUseCase } from '../../application/use-cases/create-calendar-label.use-case';
import { DeleteCalendarEventUseCase } from '../../application/use-cases/delete-calendar-event.use-case';
import { DeleteCalendarLabelUseCase } from '../../application/use-cases/delete-calendar-label.use-case';
import { EditCalendarEventUseCase } from '../../application/use-cases/edit-calendar-event.use-case';
import { EditCalendarLabelUseCase } from '../../application/use-cases/edit-calendar-label.use-case';
import { GetCalendarEventUseCase } from '../../application/use-cases/get-calendar-event.use-case';
import { ListCalendarEventsUseCase } from '../../application/use-cases/list-calendar-events.use-case';
import { ListCalendarLabelsUseCase } from '../../application/use-cases/list-calendar-labels.use-case';
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
            this.labelPreconditions,
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
        return new EditCalendarEventUseCase(
            this.calendarEventRepository,
            this.preconditions,
            this.labelPreconditions,
            this.dateTimeProvider,
            this.eventPublishingService,
        );
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

    listCalendarLabelsUseCase(): ListCalendarLabelsUseCase {
        return new ListCalendarLabelsUseCase(this.calendarLabelRepository);
    }

    createCalendarLabelUseCase(): CreateCalendarLabelUseCase {
        return new CreateCalendarLabelUseCase(...this.labelDependencies());
    }

    editCalendarLabelUseCase(): EditCalendarLabelUseCase {
        return new EditCalendarLabelUseCase(...this.labelDependencies());
    }

    deleteCalendarLabelUseCase(): DeleteCalendarLabelUseCase {
        return new DeleteCalendarLabelUseCase(
            this.calendarLabelRepository,
            this.calendarEventRepository,
            this.labelPreconditions,
            this.unitOfWork,
            this.dateTimeProvider,
            this.eventPublishingService,
        );
    }

    private labelDependencies() {
        return [
            this.calendarLabelRepository,
            this.labelPreconditions,
            this.dateTimeProvider,
            this.eventPublishingService,
        ] as const;
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
