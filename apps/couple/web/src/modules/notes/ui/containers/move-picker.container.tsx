'use client';

import { noteSheetGateways, noteSpaceContentsGateway } from '../../gateways';
import { useMoveSheet } from '../../hooks/use-move-sheet';
import {
    isWhereItIs,
    presentPickerFolders,
} from '../../presenters/moved-item.presenter';
import type { MovedItem } from '../../view-models/moved-item.view-model';
import type { NotePlaceLevel } from '../../view-models/note-space-screen.view-model';
import { MovePickerView } from '../views/move-picker.view';

type Props = {
    readonly item: MovedItem;
    readonly level: NotePlaceLevel;
    readonly onClose: () => void;
};

export function MovePickerContainer({ item, level, onClose }: Props) {
    const picker = useMoveSheet({
        gateways: noteSheetGateways,
        contents: noteSpaceContentsGateway,
        item,
        start: level,
        onClose,
    });
    return (
        <MovePickerView
            item={item}
            level={picker.level}
            folders={presentPickerFolders(picker.level, item)}
            isWhereItIs={isWhereItIs(picker.level, item)}
            isLoading={picker.isLoading}
            isMoving={picker.isMoving}
            isBusy={picker.isBusy}
            onShow={picker.show}
            onMoveHere={picker.moveHere}
        />
    );
}
