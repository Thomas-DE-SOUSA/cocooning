import { FolderKindEnum } from '@cocooning/couple-shared-kernel/enums';
import { z } from 'zod';
import { CardTemplateSchema } from './card-template.zod';
import { FolderNameSchema } from './folder-name.zod';
import { FolderSubjectSchema } from './folder-subject.zod';
import { NoteSpaceSchema } from './note-space.zod';

// R13: a null parent is the root of the space. R17: a smart folder brings its subject and card template,
// unless it is created inside a smart folder, whose template it inherits (R18); the domain decides.
export const CreateFolderRequestSchema = z.object({
    space: NoteSpaceSchema,
    parentFolderId: z.uuid().nullable(),
    name: FolderNameSchema,
    kind: z.enum(Object.values(FolderKindEnum)).default(FolderKindEnum.CLASSIC),
    subject: FolderSubjectSchema.nullable().default(null),
    cardTemplate: CardTemplateSchema.nullable().default(null),
});

export type CreateFolderRequest = z.infer<typeof CreateFolderRequestSchema>;
