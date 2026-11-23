import {
    EMAIL_ADDRESS_MAX_LENGTH,
    PASSWORD_MAX_LENGTH,
} from '@cocooning/couple-shared-kernel/limits';
import { z } from 'zod';
import type { Translator } from '../../../shared/translator';

// The raw bounds of SignInRequestSchema: the address is not checked for its shape, and the password policy applies only at creation (R2, R3).
export const createSignInFormSchema = (t: Translator) =>
    z.object({
        emailAddress: z
            .string()
            .trim()
            .min(1, t('form.emailAddress.errors.required'))
            .max(
                EMAIL_ADDRESS_MAX_LENGTH,
                t('form.emailAddress.errors.tooLong'),
            ),
        password: z
            .string()
            .min(1, t('form.password.errors.required'))
            .max(PASSWORD_MAX_LENGTH, t('form.password.errors.tooLong')),
    });

export type SignInForm = z.infer<ReturnType<typeof createSignInFormSchema>>;
