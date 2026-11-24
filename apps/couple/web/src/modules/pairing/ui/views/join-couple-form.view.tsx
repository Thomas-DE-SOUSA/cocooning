'use client';

import type { JoinCoupleForm } from '@cocooning/couple-client-business-logic/pairing';
import {
    Button,
    Card,
    Field,
    FieldError,
    Input,
    Label,
    Spinner,
} from '@cocooning/design-system';
import type { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PAIRING_NAMESPACE } from '../../data/pairing-i18n-namespaces';

type Props = {
    readonly form: UseFormReturn<JoinCoupleForm>;
    readonly isPending: boolean;
    readonly isBusy: boolean;
    readonly onJoin: (form: JoinCoupleForm) => void;
};

const CODE_ERROR_ID = 'join-couple-invitation-code-error';

// R3: upper case offered by the keyboard, no autocorrect; the domain still accepts lower case and spaces.
export function JoinCoupleFormView({ form, isPending, isBusy, onJoin }: Props) {
    const { t } = useTranslation(PAIRING_NAMESPACE);
    const { errors } = form.formState;
    return (
        <Card className="w-full max-w-sm p-5">
            <form
                method="post"
                noValidate
                onSubmit={form.handleSubmit(onJoin)}
                className="flex flex-col gap-4"
            >
                <p className="text-center text-sm text-muted-foreground">
                    {t('noCouple.joinIntro')}
                </p>
                <Field>
                    <Label htmlFor="invitationCode">
                        {t('form.invitationCode.label')}
                    </Label>
                    <Input
                        id="invitationCode"
                        autoComplete="off"
                        autoCapitalize="characters"
                        autoCorrect="off"
                        spellCheck={false}
                        enterKeyHint="go"
                        className="font-mono tracking-widest uppercase"
                        aria-invalid={Boolean(errors.invitationCode)}
                        aria-describedby={CODE_ERROR_ID}
                        {...form.register('invitationCode')}
                    />
                    <FieldError id={CODE_ERROR_ID}>
                        {errors.invitationCode?.message}
                    </FieldError>
                </Field>
                <Button
                    type="submit"
                    variant="outline"
                    disabled={isBusy}
                    aria-busy={isPending}
                >
                    {isPending ? (
                        <Spinner aria-label={t('noCouple.joining')} />
                    ) : (
                        t('noCouple.join')
                    )}
                </Button>
            </form>
        </Card>
    );
}
