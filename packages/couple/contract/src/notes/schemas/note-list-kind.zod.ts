import { NoteListKindEnum } from '@cocooning/couple-shared-kernel/enums';
import { z } from 'zod';

// R26: « Courses » or « Tâches », the section of the Lists tab.
export const NoteListKindSchema = z.enum(Object.values(NoteListKindEnum));
