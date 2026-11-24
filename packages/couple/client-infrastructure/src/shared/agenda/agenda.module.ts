import {
    CreateCalendarEventUseCase,
    DeleteCalendarEventUseCase,
    EditCalendarEventUseCase,
    GetCalendarEventUseCase,
    ListCalendarEventsUseCase,
    MakeCalendarEventPrivateUseCase,
    ShareCalendarEventUseCase,
} from '@cocooning/couple-client-business-logic/agenda';
import { createCoupleHttpConfig } from '../couple-http-config';
import type { SessionTokenProvider } from '../session/session-headers';
import { resolveAgendaEndpoints } from './endpoints/agenda.endpoints';
import { ApiAgendaGateway } from './gateways/api-agenda.gateway';

export type AgendaModule = {
    readonly listCalendarEvents: ListCalendarEventsUseCase;
    readonly getCalendarEvent: GetCalendarEventUseCase;
    readonly createCalendarEvent: CreateCalendarEventUseCase;
    readonly editCalendarEvent: EditCalendarEventUseCase;
    readonly shareCalendarEvent: ShareCalendarEventUseCase;
    readonly makeCalendarEventPrivate: MakeCalendarEventPrivateUseCase;
    readonly deleteCalendarEvent: DeleteCalendarEventUseCase;
};

// The gateway stays inside; getSessionToken is only called when a use case runs (decision 0036).
export function createAgendaModule(
    apiBaseUrl: string,
    timeoutMs: number,
    getSessionToken: SessionTokenProvider,
): AgendaModule {
    const gateway = new ApiAgendaGateway(
        resolveAgendaEndpoints(apiBaseUrl),
        createCoupleHttpConfig(timeoutMs),
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
    };
}
