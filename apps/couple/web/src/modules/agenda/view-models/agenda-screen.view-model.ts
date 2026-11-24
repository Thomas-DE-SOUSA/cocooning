import type { ApiError } from '@cocooning/couple-client-business-logic/shared';

// Glossary "Couleur de l'auteur": terracotta for the partner who created the couple, sage for the other.
export const AuthorColorEnum = {
    TERRACOTTA: 'TERRACOTTA',
    SAGE: 'SAGE',
} as const;

export type AuthorColor =
    (typeof AuthorColorEnum)[keyof typeof AuthorColorEnum];

export type DayMark = {
    readonly calendarEventId: string;
    readonly color: AuthorColor;
    readonly isPrivate: boolean;
};

export type DayMarks = Readonly<Record<string, readonly DayMark[]>>;

export const EventSpanKindEnum = {
    UNTIL: 'UNTIL',
    SINCE: 'SINCE',
} as const;

export type EventSpan = {
    readonly kind: (typeof EventSpanKindEnum)[keyof typeof EventSpanKindEnum];
    readonly day: string;
};

export type AgendaDayItem = {
    readonly calendarEventId: string;
    readonly title: string;
    readonly description: string | null;
    readonly startsAt: string | null;
    readonly endsAt: string | null;
    readonly span: EventSpan | null;
    readonly isOwner: boolean;
    readonly isPrivate: boolean;
    readonly color: AuthorColor;
};

export type AgendaCalendarViewModel = {
    readonly today: string;
    readonly selectedDay: string;
    readonly month: string;
    readonly firstYear: number;
    readonly lastYear: number;
    readonly marks: DayMarks;
};

export type AgendaDayViewModel = {
    readonly label: string;
    readonly isToday: boolean;
    readonly items: readonly AgendaDayItem[];
};

export const AgendaStepEnum = {
    CALENDAR: 'CALENDAR',
    UNAVAILABLE: 'UNAVAILABLE',
} as const;

export type AgendaScreenViewModel =
    | {
          readonly step: typeof AgendaStepEnum.CALENDAR;
          readonly calendar: AgendaCalendarViewModel;
          readonly day: AgendaDayViewModel;
      }
    | {
          readonly step: typeof AgendaStepEnum.UNAVAILABLE;
          readonly error: ApiError;
      };

export type AgendaPage =
    | { readonly redirectTo: string; readonly viewModel: null }
    | { readonly redirectTo: null; readonly viewModel: AgendaScreenViewModel };
