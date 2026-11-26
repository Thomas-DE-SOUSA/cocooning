import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { CalendarLabelItem } from './calendar-label.view-model';

export const CalendarLabelsCardStepEnum = {
    LIST: 'LIST',
    UNAVAILABLE: 'UNAVAILABLE',
} as const;

// The card "Étiquettes de l'agenda" of the "Nous" tab: the labels of the couple, or why they could not be read.
export type CalendarLabelsCardViewModel =
    | {
          readonly step: typeof CalendarLabelsCardStepEnum.LIST;
          readonly labels: readonly CalendarLabelItem[];
      }
    | {
          readonly step: typeof CalendarLabelsCardStepEnum.UNAVAILABLE;
          readonly error: ApiError;
      };
