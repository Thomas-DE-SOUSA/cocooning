import {
    CreateCalendarEventUseCase,
    CreateCalendarLabelUseCase,
    DeleteCalendarEventUseCase,
    DeleteCalendarLabelUseCase,
    EditCalendarEventUseCase,
    EditCalendarLabelUseCase,
    GetCalendarEventUseCase,
    ListCalendarEventsUseCase,
    ListCalendarLabelsUseCase,
    MakeCalendarEventPrivateUseCase,
    ShareCalendarEventUseCase,
} from '@cocooning/couple-client-business-logic/agenda';
import { createCoupleHttpConfig } from '../couple-http-config';
import type { SessionTokenProvider } from '../session/session-headers';
import { resolveAgendaEndpoints } from './endpoints/agenda.endpoints';
import { resolveCalendarLabelsEndpoints } from './endpoints/calendar-labels.endpoints';
import { ApiAgendaGateway } from './gateways/api-agenda.gateway';
import { ApiCalendarLabelsGateway } from './gateways/api-calendar-labels.gateway';

export type AgendaModule = {
    readonly listCalendarEvents: ListCalendarEventsUseCase;
    readonly getCalendarEvent: GetCalendarEventUseCase;
    readonly createCalendarEvent: CreateCalendarEventUseCase;
    readonly editCalendarEvent: EditCalendarEventUseCase;
    readonly shareCalendarEvent: ShareCalendarEventUseCase;
    readonly makeCalendarEventPrivate: MakeCalendarEventPrivateUseCase;
    readonly deleteCalendarEvent: DeleteCalendarEventUseCase;
    readonly listCalendarLabels: ListCalendarLabelsUseCase;
    readonly createCalendarLabel: CreateCalendarLabelUseCase;
    readonly editCalendarLabel: EditCalendarLabelUseCase;
    readonly deleteCalendarLabel: DeleteCalendarLabelUseCase;
};

// The gateways stay inside; getSessionToken is only called when a use case runs (decision 0036).
export function createAgendaModule(
    apiBaseUrl: string,
    timeoutMs: number,
    getSessionToken: SessionTokenProvider,
): AgendaModule {
    const httpConfig = createCoupleHttpConfig(timeoutMs);
    const gateway = new ApiAgendaGateway(
        resolveAgendaEndpoints(apiBaseUrl),
        httpConfig,
        getSessionToken,
    );
    const labels = new ApiCalendarLabelsGateway(
        resolveCalendarLabelsEndpoints(apiBaseUrl),
        httpConfig,
        getSessionToken,
    );
    return {
        listCalendarEvents: new ListCalendarEventsUseCase(gateway),
        getCalendarEvent: new GetCalendarEventUseCase(gateway),
        createCalendarEvent: new CreateCalendarEventUseCase(gateway),
        editCalendarEvent: new EditCalendarEventUseCase(gateway),
        shareCalendarEvent: new ShareCalendarEventUseCase(gateway),
        makeCalendarEventPrivate: new MakeCalendarEventPrivateUseCase(gateway),
        deleteCalendarEvent: new DeleteCalendarEventUseCase(gateway),
        listCalendarLabels: new ListCalendarLabelsUseCase(labels),
        createCalendarLabel: new CreateCalendarLabelUseCase(labels),
        editCalendarLabel: new EditCalendarLabelUseCase(labels),
        deleteCalendarLabel: new DeleteCalendarLabelUseCase(labels),
    };
}
