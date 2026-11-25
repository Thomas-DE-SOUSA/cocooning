import { z } from 'zod';

// The Interactions API (decision 0054): the model answers in steps; its text is in the model_output steps.
// Only what is read is described: the rest of the interaction is ignored.
const InteractionSchema = z.object({
    steps: z.array(
        z.object({
            type: z.string(),
            content: z
                .array(
                    z.object({ type: z.string(), text: z.string().optional() }),
                )
                .optional(),
        }),
    ),
});

// The text of the answer, or null when the interaction holds none.
export const answerTextOf = (body: unknown): string | null => {
    const parsed = InteractionSchema.safeParse(body);
    if (!parsed.success) return null;
    const text = parsed.data.steps
        .filter((step) => step.type === 'model_output')
        .flatMap((step) => step.content ?? [])
        .flatMap((part) =>
            part.type === 'text' && part.text ? [part.text] : [],
        )
        .join('');
    return text.length === 0 ? null : text;
};

// The JSON the model was asked for, checked by its schema, or null: never trusted as it comes (core.md rule 28).
export const answerOf = <T>(
    body: unknown,
    answerSchema: z.ZodType<T>,
): T | null => {
    const text = answerTextOf(body);
    if (text === null) return null;
    try {
        const parsed = answerSchema.safeParse(JSON.parse(text));
        return parsed.success ? parsed.data : null;
    } catch {
        return null;
    }
};
