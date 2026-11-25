'use client';

import { Button, Spinner } from '@cocooning/design-system';
import { ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NOTE_SPACE_NAMESPACE } from '../../data/note-space-i18n-namespaces';
import { presentLocation } from '../../presenters/note-place.presenter';
import { presentPlaceName } from '../../presenters/place-labels.presenter';
import {
    type MovedItem,
    MovedItemKindEnum,
} from '../../view-models/moved-item.view-model';
import type { NoteLocation } from '../../view-models/note-place.view-model';
import type {
    FolderListItem,
    NotePlaceLevel,
} from '../../view-models/note-space-screen.view-model';
import { PickerFolders } from '../components/picker-folders';
import { SheetHeading } from '../components/sheet-heading';
import { SpaceSwitch } from '../components/space-switch';

type Props = {
    readonly item: MovedItem;
    readonly level: NotePlaceLevel;
    readonly folders: readonly FolderListItem[];
    readonly isWhereItIs: boolean;
    readonly isLoading: boolean;
    readonly isMoving: boolean;
    readonly isBusy: boolean;
    readonly onShow: (location: NoteLocation) => void;
    readonly onMoveHere: () => void;
};

// R11, R15: choose the space (a note of its owner only), go down the folders or back up, then « Déplacer ici ».
export function MovePickerView({ item, level, folders, ...props }: Props) {
    const { t } = useTranslation(NOTE_SPACE_NAMESPACE);
    const { back } = level;
    const { space } = level.place;
    const waits = props.isBusy || props.isLoading;
    return (
        <>
            <SheetHeading
                title={t('move.title', { name: item.name })}
                description={t(
                    item.kind === MovedItemKindEnum.NOTE
                        ? 'move.noteHint'
                        : 'move.folderHint',
                )}
            />
            <div className="flex min-h-0 flex-1 flex-col gap-3 px-5 pb-6">
                {item.spaces.length > 1 ? (
                    <SpaceSwitch
                        spaces={item.spaces}
                        current={space}
                        disabled={waits}
                        onChoose={(next) =>
                            props.onShow({ space: next, folderId: null })
                        }
                    />
                ) : null}
                {back === null ? null : (
                    <button
                        type="button"
                        disabled={waits}
                        onClick={() => props.onShow(presentLocation(back))}
                        className="inline-flex min-h-11 items-center gap-1 self-start font-semibold text-primary disabled:opacity-50"
                    >
                        <ChevronLeft
                            aria-hidden="true"
                            className="size-5"
                        />
                        {presentPlaceName(back, t)}
                    </button>
                )}
                <div className="min-h-0 flex-1 overflow-y-auto">
                    <PickerFolders
                        folders={folders}
                        isLoading={props.isLoading}
                        onOpen={(folder) =>
                            props.onShow({ space, folderId: folder.folderId })
                        }
                    />
                </div>
                <Button
                    className="h-12 w-full text-base"
                    disabled={props.isWhereItIs || waits}
                    aria-busy={props.isMoving}
                    onClick={props.onMoveHere}
                >
                    {props.isMoving ? (
                        <Spinner aria-label={t('move.moving')} />
                    ) : (
                        t('move.here', {
                            place: presentPlaceName(level.place, t),
                        })
                    )}
                </Button>
            </div>
        </>
    );
}
