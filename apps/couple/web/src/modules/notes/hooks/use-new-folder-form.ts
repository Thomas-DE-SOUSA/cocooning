import {
    createSmartFolderFormSchema,
    type SmartFolderForm,
} from '@cocooning/couple-client-business-logic/notes';
import {
    type FolderKind,
    FolderKindEnum,
} from '@cocooning/couple-shared-kernel/enums';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { NOTE_SPACE_NAMESPACE } from '../data/note-space-i18n-namespaces';
import { createClassicFolderFormSchema } from '../presenters/classic-folder-form.zod';

const EMPTY_FOLDER: SmartFolderForm = { name: '', subject: '', fields: [] };

// R13, R17: one form for « Classique » and « IA »; the kind chosen picks the rules it is checked with (decision 0031).
export function useNewFolderForm() {
    const { t } = useTranslation(NOTE_SPACE_NAMESPACE);
    const [kind, setKind] = useState<FolderKind>(FolderKindEnum.CLASSIC);
    const resolvers = useMemo(
        () => ({
            [FolderKindEnum.CLASSIC]: zodResolver(
                createClassicFolderFormSchema(t),
            ),
            [FolderKindEnum.SMART]: zodResolver(createSmartFolderFormSchema(t)),
        }),
        [t],
    );
    const form = useForm<SmartFolderForm>({
        resolver: resolvers[kind],
        defaultValues: EMPTY_FOLDER,
        mode: 'onSubmit',
        reValidateMode: 'onChange',
    });
    return { form, kind, setKind };
}
