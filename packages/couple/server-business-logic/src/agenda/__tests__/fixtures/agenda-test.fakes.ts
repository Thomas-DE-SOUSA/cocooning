import {
    CalendarEventAudienceEnum,
    type CalendarEventVisibility,
    CalendarEventVisibilityEnum,
    type CalendarLabelColor,
    CalendarLabelColorEnum,
} from '@cocooning/couple-shared-kernel/enums';
import { EventPublishingService } from '@cocooning/shared-kernel/application';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import {
    DeterministicDateTimeProvider,
    FakeEventPublisherAdapter,
    FakeLoggerAdapter,
    FakeUuidV7GeneratorProvider,
} from '@cocooning/shared-kernel/testing';
import { CalendarEvent } from '../../domain/models/calendar-event.aggregate';
import { CalendarLabel } from '../../domain/models/calendar-label.aggregate';
import { CalendarEventPreconditionService } from '../../domain/services/calendar-event-precondition.service';
import { CalendarLabelPreconditionService } from '../../domain/services/calendar-label-precondition.service';
import {
    type CalendarEventDetailsInput,
    createCalendarEventDetails,
} from '../../domain/value-objects/calendar-event-details';
import { CalendarEventId } from '../../domain/value-objects/calendar-event-id.vo';
import { CalendarLabelName } from '../../domain/value-objects/calendar-label-name.vo';
import { CalendarEventInMemoryRepository } from '../secondary/adapters/calendar-event-in-memory.repository';
import { CalendarLabelInMemoryRepository } from '../secondary/adapters/calendar-label-in-memory.repository';
import { FakePairedCoupleProvider } from '../secondary/adapters/fake-paired-couple.provider';
import { DINNER, MILLISECONDS_PER_HOUR, NOW } from './agenda-test.data';

// The fakes of the agenda and the given steps; AgendaTestContext adds the use cases.
export class AgendaTestFakes {
    readonly dateTimeProvider = new DeterministicDateTimeProvider(NOW);
    readonly calendarEventRepository = new CalendarEventInMemoryRepository();
    readonly calendarLabelRepository = new CalendarLabelInMemoryRepository();
    readonly pairedCoupleProvider = new FakePairedCoupleProvider();
    readonly eventPublisher = new FakeEventPublisherAdapter();
    readonly logger = new FakeLoggerAdapter();
    protected readonly eventPublishingService = new EventPublishingService(
        this.eventPublisher,
        this.logger,
    );
    protected readonly preconditions = new CalendarEventPreconditionService(
        this.calendarEventRepository,
    );
    protected readonly labelPreconditions =
        new CalendarLabelPreconditionService(this.calendarLabelRepository);

    constructor() {
        CalendarEventId.configure(new FakeUuidV7GeneratorProvider());
    }

    // An event of the couple, as if already in the database, without events.
    givenEventOf(
        context: ExecutionContext,
        details: Partial<CalendarEventDetailsInput> = {},
        visibility: CalendarEventVisibility = CalendarEventVisibilityEnum.SHARED,
    ): CalendarEvent {
        const calendarEvent = CalendarEvent.create(
            {
                coupleId: context.coupleId,
                ownerId: context.userId,
                details: createCalendarEventDetails({ ...DINNER, ...details }),
                visibility,
            },
            this.dateTimeProvider.now(),
        );
        calendarEvent.clearDomainEvents();
        this.calendarEventRepository.seed(calendarEvent);
        return calendarEvent;
    }

    givenPrivateEventOf(
        context: ExecutionContext,
        details: Partial<CalendarEventDetailsInput> = {},
    ): CalendarEvent {
        return this.givenEventOf(
            context,
            {
                title: 'Surprise',
                audience: CalendarEventAudienceEnum.OWNER,
                ...details,
            },
            CalendarEventVisibilityEnum.PRIVATE,
        );
    }

    // A label of the couple, as if already in the database, without events.
    givenLabelOf(
        context: ExecutionContext,
        name = 'Sport',
        color: CalendarLabelColor = CalendarLabelColorEnum.SAGE,
    ): CalendarLabel {
        const label = CalendarLabel.create(
            {
                coupleId: context.coupleId,
                ownerId: context.userId,
                name: CalendarLabelName.create(name),
                color,
            },
            this.dateTimeProvider.now(),
        );
        label.clearDomainEvents();
        this.calendarLabelRepository.seed(label);
        return label;
    }

    advanceHours(hours: number): void {
        this.dateTimeProvider.advanceBy(hours * MILLISECONDS_PER_HOUR);
    }
}
