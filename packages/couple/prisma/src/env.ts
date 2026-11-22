import { z } from 'zod';

export const couplePrismaEnvSchema = z.object({
    DATABASE_POSTGRES_URL: z.url({ protocol: /^postgres(ql)?$/ }),
});

export type CouplePrismaEnv = z.infer<typeof couplePrismaEnvSchema>;
