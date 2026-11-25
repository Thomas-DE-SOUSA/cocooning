'use client';

import {
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from '@cocooning/design-system';
import { useTranslation } from 'react-i18next';
import { CommandButton } from '@/shared/ui/command-button';
import { MESSAGING_NAMESPACE } from '../../data/messaging-i18n-namespaces';

type Props = {
    readonly isWithdrawing: boolean;
    readonly isBusy: boolean;
    readonly onWithdraw: () => void;
    readonly onKeep: () => void;
};

// R6: the author withdraws what they sent, for both partners; a tap on the item opens this sheet (no long press on iOS).
export function WithdrawSheetView(props: Props) {
    const { t } = useTranslation(MESSAGING_NAMESPACE);
    return (
        <DrawerContent>
            <DrawerHeader className="flex-col items-start gap-1 px-5 pt-4">
                <DrawerTitle className="text-xl">
                    {t('withdraw.title')}
                </DrawerTitle>
                <DrawerDescription>
                    {t('withdraw.description')}
                </DrawerDescription>
            </DrawerHeader>
            <div className="flex flex-col gap-2 px-5 pt-2 pb-6">
                <CommandButton
                    variant="destructive"
                    label={t('withdraw.confirm')}
                    pendingLabel={t('withdraw.withdrawing')}
                    isPending={props.isWithdrawing}
                    isBusy={props.isBusy}
                    onClick={props.onWithdraw}
                />
                <CommandButton
                    variant="ghost"
                    label={t('withdraw.keep')}
                    pendingLabel={t('withdraw.keep')}
                    isPending={false}
                    isBusy={props.isBusy}
                    onClick={props.onKeep}
                />
            </div>
        </DrawerContent>
    );
}
