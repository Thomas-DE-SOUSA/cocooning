'use client';

import { Calendar, Card } from '@cocooning/design-system';
import { fr } from 'react-day-picker/locale';
import { useTranslation } from 'react-i18next';
import { AGENDA_NAMESPACE } from '../../data/agenda-i18n-namespaces';
import { firstDayOf, monthOf } from '../../presenters/calendar-day.presenter';
import {
    fromLocalDate,
    toLocalDate,
} from '../../presenters/local-date.presenter';
import type { AgendaCalendarViewModel } from '../../view-models/agenda-screen.view-model';
import { AgendaDayButton } from '../components/agenda-day-button';
import { DayMarksContext } from '../components/day-marks-context';

const MONDAY = 1;
const LAST_MONTH = 12;

type Props = {
    readonly calendar: AgendaCalendarViewModel;
    readonly selectedDay: string;
    readonly onSelectDay: (day: string) => void;
    readonly onChangeMonth: (month: string) => void;
};

// The month grid (decision 0048): a day is chosen by a tap, the month and the year from the caption or the chevrons.
export function AgendaCalendarView({
    calendar,
    selectedDay,
    onSelectDay,
    onChangeMonth,
}: Props) {
    const { t } = useTranslation(AGENDA_NAMESPACE);
    return (
        <Card className="p-3">
            <DayMarksContext value={calendar.marks}>
                <Calendar
                    mode="single"
                    required
                    locale={fr}
                    weekStartsOn={MONDAY}
                    captionLayout="dropdown"
                    startMonth={toLocalDate(
                        firstDayOf(`${calendar.firstYear}-01`),
                    )}
                    endMonth={toLocalDate(
                        firstDayOf(`${calendar.lastYear}-${LAST_MONTH}`),
                    )}
                    month={toLocalDate(firstDayOf(calendar.month))}
                    onMonthChange={(month) =>
                        onChangeMonth(monthOf(fromLocalDate(month)))
                    }
                    today={toLocalDate(calendar.today)}
                    selected={toLocalDate(selectedDay)}
                    onSelect={(day) => onSelectDay(fromLocalDate(day))}
                    labels={{
                        labelPrevious: () => t('calendar.previousMonth'),
                        labelNext: () => t('calendar.nextMonth'),
                        labelMonthDropdown: () => t('calendar.monthDropdown'),
                        labelYearDropdown: () => t('calendar.yearDropdown'),
                    }}
                    components={{ DayButton: AgendaDayButton }}
                />
            </DayMarksContext>
        </Card>
    );
}
