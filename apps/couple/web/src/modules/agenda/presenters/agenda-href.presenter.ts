import { WebRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import type { AgendaQuery } from '../view-models/agenda-query.view-model';

// The address of a day and a month of the agenda, read back by the page (decision 0048).
export const resolveAgendaHref = (query: AgendaQuery): string =>
    `${WebRouterEnum.AGENDA}?${new URLSearchParams(query).toString()}`;
