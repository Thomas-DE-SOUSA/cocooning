import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { CalendarLabelListResponse } from '@cocooning/couple-contract/agenda';
import type { Result } from '@cocooning/shared-kernel/utils';
import {
    type CalendarLabelsCardViewModel,
    CalendarLabelsCardStepEnum,
} from '../view-models/calendar-labels-card.view-model';
import { presentCalendarLabels } from './calendar-labels.presenter';

// The "Nous" page has already sent a partner without a couple away: a refused reading only empties this card.
export const presentCalendarLabelsCard = (
    labels: Result<CalendarLabelListResponse, ApiError>,
): CalendarLabelsCardViewModel =>
    labels.success
        ? {
              step: CalendarLabelsCardStepEnum.LIST,
              labels: presentCalendarLabels(labels.value),
          }
        : { step: CalendarLabelsCardStepEnum.UNAVAILABLE, error: labels.error };
