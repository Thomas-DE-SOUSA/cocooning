import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { NoteViewModel } from '../../view-models/note.view-model';

export function AllowedView({
    viewModel,
}: {
    readonly viewModel: NoteViewModel;
}) {
    const { t } = useTranslation('notes/editor');
    const form = useForm();
    return (
        <form onSubmit={form.handleSubmit(viewModel.onSave)}>{t('title')}</form>
    );
}
