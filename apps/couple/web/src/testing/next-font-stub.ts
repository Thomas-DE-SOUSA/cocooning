type FontLoaderOptions = { readonly variable: string };

const loadFont = ({ variable }: FontLoaderOptions) => ({ variable });

export const Fraunces = loadFont;
export const Inter = loadFont;
