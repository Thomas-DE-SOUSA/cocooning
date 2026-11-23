import {
    EMAIL_ADDRESS_MAX_LENGTH,
    PASSWORD_MAX_LENGTH,
} from '@cocooning/couple-shared-kernel/limits';
import { z } from 'zod';

// Raw bounds only: the domain normalizes the address, and a malformed one simply matches no account (R3).
// The password length is bounded so that no one makes the API hash megabytes; its policy applies at creation (R2).
export const SignInRequestSchema = z.object({
    emailAddress: z.string().trim().min(1).max(EMAIL_ADDRESS_MAX_LENGTH),
    password: z.string().min(1).max(PASSWORD_MAX_LENGTH),
});

export type SignInRequest = z.infer<typeof SignInRequestSchema>;
