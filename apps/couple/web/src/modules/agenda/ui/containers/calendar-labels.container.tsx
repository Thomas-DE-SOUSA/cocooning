'use client';

import { Drawer } from '@cocooning/design-system';
import { useTranslation } from 'react-i18next';
import { describeApiResultError } from '@/shared/application/api-result/describe-api-result-error';
import { UnavailableNotice } from '@/shared/ui/unavailable-notice';
import { CALENDAR_LABELS_NAMESPACE } from '../../data/calendar-labels-i18n-namespace';
import { useCalendarLabelsCard } from '../../hooks/use-calendar-labels-card';
import { CalendarLabelSheetModeEnum } from '../../view-models/calendar-label-command.view-model';
import {
    type CalendarLabelsCardViewModel,
    CalendarLabelsCardStepEnum,
} from '../../view-models/calendar-labels-card.view-model';
import { CalendarLabelsCardView } from '../views/calendar-labels-card.view';
import { CalendarLabelSheetContainer } from './calendar-label-sheet.container';

// The card "Étiquettes de l'agenda" of the "Nous" tab (decision 0057): the labels, and the sheet that edits one.
export function CalendarLabelsContainer({
    viewModel,
}: {
    readonly viewModel: CalendarLabelsCardViewModel;
}) {
    const { t } = useTranslation(CALENDAR_LABELS_NAMESPACE);
    const card = useCalendarLabelsCard();
    if (viewModel.step === CalendarLabelsCardStepEnum.UNAVAILABLE) {
        return (
            <UnavailableNotice
                title={t('unavailable.title')}
                description={describeApiResultError(viewModel.error, t)}
                retryLabel={t('unavailable.refresh')}
                onRetry={card.refresh}
            />
        );
    }
    return (
        <>
            <CalendarLabelsCardView
                labels={viewModel.labels}
                onOpenLabel={card.open}
            />
            <Drawer
                open={card.isOpen}
                onOpenChange={(open) => {
                    if (!open) card.close();
                }}
            >
                {card.label === null ? null : (
                    <CalendarLabelSheetContainer
                        key={card.opening}
                        target={{
                            mode: CalendarLabelSheetModeEnum.EDIT,
                            label: card.label,
                        }}
                        onClose={card.close}
                        onDone={card.closeAndRefresh}
                        onStale={card.closeAndRefresh}
                    />
                )}
            </Drawer>
        </>
    );
}
