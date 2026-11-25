import { NoteSpaceEnum } from '@cocooning/couple-shared-kernel/enums';
import { z } from 'zod';

// R10: « Partagé » or « Privé ».
export const NoteSpaceSchema = z.enum(Object.values(NoteSpaceEnum));
