'use client';

import { Button } from '@cocooning/design-system';
import { useTranslation } from 'react-i18next';
import { NOTE_LISTS_NAMESPACE } from '../../data/note-lists-i18n-namespaces';
import { SheetHeading } from '../components/sheet-heading';

type Props = {
    readonly count: number;
    readonly onConfirm: () => void;
    readonly onKeep: () => void;
};

// R31: the checked lines go for both partners without history, and the app has no undo: it asks once more.
export function ClearDoneSheetView({ count, onConfirm, onKeep }: Props) {
    const { t } = useTranslation(NOTE_LISTS_NAMESPACE);
    return (
        <>
            <SheetHeading
                title={t('clearDone.title')}
                description={t('clearDone.description', { count })}
            />
            <div className="flex flex-col gap-2 px-5 pt-2 pb-6">
                <Button
                    variant="destructive"
                    onClick={onConfirm}
                >
                    {t('clearDone.confirm')}
                </Button>
                <Button
                    variant="outline"
                    onClick={onKeep}
                >
                    {t('clearDone.keep')}
                </Button>
            </div>
        </>
    );
}
