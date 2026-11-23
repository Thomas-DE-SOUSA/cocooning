import { INVITATION_CODE_ENTRY_MAX_LENGTH } from '@cocooning/couple-shared-kernel/limits';
import { z } from 'zod';
import type { Translator } from '../../../shared/translator';

// The raw bound of JoinCoupleRequestSchema: case and spaces are the domain's business (R3), a wrong code only the API can tell (R6).
export const createJoinCoupleFormSchema = (t: Translator) =>
    z.object({
        invitationCode: z
            .string()
            .trim()
            .min(1, t('form.invitationCode.errors.required'))
            .max(
                INVITATION_CODE_ENTRY_MAX_LENGTH,
                t('form.invitationCode.errors.tooLong'),
            ),
    });

export type JoinCoupleForm = z.infer<
    ReturnType<typeof createJoinCoupleFormSchema>
>;
