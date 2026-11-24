'use client';

import { useTranslation } from 'react-i18next';
import { describeApiResultError } from '@/shared/application/api-result/describe-api-result-error';
import { UnavailableNotice } from '@/shared/ui/unavailable-notice';
import { AGENDA_NAMESPACE } from '../../data/agenda-i18n-namespaces';
import { useAgendaScreen } from '../../hooks/use-agenda-screen';
import {
    type AgendaScreenViewModel,
    AgendaStepEnum,
} from '../../view-models/agenda-screen.view-model';
import { AgendaCalendarView } from '../views/agenda-calendar.view';
import { AgendaDayView } from '../views/agenda-day.view';

export function AgendaContainer({
    viewModel,
}: {
    readonly viewModel: AgendaScreenViewModel;
}) {
    const { t } = useTranslation(AGENDA_NAMESPACE);
    const screen = useAgendaScreen();
    if (viewModel.step === AgendaStepEnum.UNAVAILABLE) {
        return (
            <UnavailableNotice
                title={t('unavailable.title')}
                description={describeApiResultError(viewModel.error, t)}
                retryLabel={t('unavailable.refresh')}
                onRetry={screen.refresh}
            />
        );
    }
    const { calendar } = viewModel;
    return (
        <>
            <AgendaCalendarView
                calendar={calendar}
                onSelectDay={screen.showDay}
                onChangeMonth={(month) =>
                    screen.showMonth(calendar.selectedDay, month)
                }
            />
            <AgendaDayView day={viewModel.day} />
        </>
    );
}
