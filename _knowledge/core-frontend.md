# Frontend Core Rules (all frontend agents)

Loaded alongside core.md for any frontend work. The web app is a Next.js PWA (D11): no native app. The detailed canons (`_knowledge/frontend/*.md`) are written at the start of phase 3, before the first frontend module.

---

## Components

1. **Server Components by default.** Every component is a Server Component unless it needs interactivity (`useState`, `useEffect`, `onClick`, `useForm`, `useRouter`). Don't add `'use client'` just to translate a string: use the server-side translation helper instead.

2. **Split components aggressively.** A component that does one thing well is better than a component that does three things. Extract skeletons, error states, empty states, form sections: even if used once. The parent stays clean, the child is self-contained. A React component stays within ~125 lines (decision 0008); a container keeps the ~80-line mark of the Feature Module Pattern.

3. **Container/View pattern.** Views are pure: data and callbacks through props, no data call, no business state. The only hooks a view calls are `useForm` (local form state) and `useTranslation()` (decision 0009), plus the form animation hook of the design system. Containers wire hooks to views. A view renders alone in its test, from props only, without mocks (platform decision 0012: no Storybook). Every module of `apps/couple/web` follows the Feature Module Pattern: `actions/`, `gateways/{ports,server-action,fake}/`, `presenters/`, `view-models/`, `services/`, `hooks/`, `ui/{containers,views,components}/`.

---

## i18n: Mandatory

4. **Every user-facing string goes through `t()`.** No hardcoded strings in components. No exceptions.

5. **Namespace = feature path.** `authentication/sign-in-form`, `modules/notes/editor`: never a bare `notes`.

6. **Zod error messages are translated, never literal text.** A form schema is built by a factory that receives `t`, `create<X>Schema(t)`, with keys `form.<field>.errors.<type>` in the feature namespace (decision 0031). Never a raw key translated at display time.

7. **Locale files stay in the app.** Never in shared packages: forces full rebuild on every translation change.

8. **Schemas in dedicated files.** Never inside a component or a hook. Suffix `*.zod.ts` for the whole repository (decision 0031).

---

## Design System: Mandatory

9. **All UI primitives from `@cocooning/design-system`; loading = skeleton.** `Button`, `Input`, `Card`, `Dialog`, `Badge`, `Tabs`, etc. Never recreate a component that exists in the design system. Loading shows a skeleton, never a lone spinner: a loading list, page or block renders `Skeleton` shaped like the expected content, and a `Spinner` only replaces the label of the button whose action is running.

10. **Icons: `lucide-react` only.** Never install `react-icons`, `@heroicons/react` or any other icon library.

11. **Form animations come from the design system.** Never re-implement them form by form.

---

## Server Actions

12. **Data mutations and queries go through Server Actions.** Never call APIs directly from client components. Route handlers (`app/api/**`) cover what an action cannot return: event streams, file downloads, proxies. Real-time note collaboration (Yjs, P5) and the Web Push subscription go through their adapters in `client-infrastructure`, never through a socket or a browser API opened in a component.

13. **Client context forwarding (authentication only).** Requests that authenticate a partner forward the browser's IP and User-Agent, otherwise the backend sees the Next.js server. Business server actions do not forward them.

14. **Server-side validation (MANDATORY).** Server Actions are public HTTP endpoints: an attacker can call them directly. Inputs MUST be validated with Zod server-side, even if the frontend already validates.

---

## Error Display

15. **Server errors (API, network): Toast** via `sonner` (`toast.error`; `toast.success` confirms a mutation). The message always comes from the single server-error describer of the web app: never `error.message`, never a module-specific translator (decision 0010).

16. **Validation errors (Zod): Inline** under the field.

17. **Frontend Result pattern.** Server actions return a discriminated union, never throw: the use case `Result<T, E>` (`{ success: true, value }` or `{ success: false, error }`, error with a domain `code`), unchanged. Hooks never throw either, and never read `result.value` without checking `success`.

---

## Routes

18. **Always via enums.** `WebRouterEnum` and `ApiRouterEnum` from `@cocooning/couple-shared-kernel/routers`. Never hardcoded route strings.

---

## State Management

19. **Minimal state.** Prefer server-side data loading over client state. Use TanStack Query for server state, with query keys from a factory, never literal arrays. Zustand only for truly global client state (session, theme). React Context for scoped state (multi-step forms).

20. **No unnecessary `useEffect`.** Most `useEffect` calls are symptoms of wrong architecture. If you need to sync state, question whether the data should come from the server instead. If you need to react to props, consider deriving the value during render instead.

---

## Hooks

21. **Hooks must not import server actions directly.** Dependencies are injected as parameters: enables testing, portability, and decoupling from Next.js.
    ```ts
    // WRONG: coupled
    import { signIn } from '../actions/sign-in.action';
    export function useSignInFlow() { ... }

    // CORRECT: decoupled
    type SignInFn = (email: string, password: string) => Promise<SignInResult>;
    export function useSignInFlow(signIn: SignInFn) { ... }
    ```

22. **Types and view models live in `view-models/`, never in hooks.** A hook file must not export types that other files need. Types are view models: they belong in `view-models/*.view-model.ts`. Hooks import from there, never the reverse.
    ```ts
    // WRONG: type defined in hook, view imports from hook
    // hooks/use-note-list.ts
    export type NoteListItem = { ... };

    // CORRECT: type in view-models/, both hook and view import from there
    // view-models/note-list-item.view-model.ts
    export type NoteListItem = { ... };
    ```

23. **Mutation hooks accept callbacks via options parameter.** When a hook wraps `useMutation`, side-effect callbacks (`onSuccess`, `onError`) must be injected via an options object: never forced on callers via `mutate(undefined, { onSuccess })`.
    ```ts
    // WRONG: caller must know useMutation internals
    const { save } = useSaveNote(noteId);
    save(undefined, { onSuccess: () => toast.success(t('toast.saved')) });

    // CORRECT: callbacks injected at hook initialization
    const { save } = useSaveNote(noteId, {
        onSaveSuccess: () => toast.success(t('toast.saved')),
        onSaveError: (error) => toast.error(t('toast.saveError'), { description: describeError(error) }),
    });
    save();
    ```

---

## Component Structure

24. **No pass-through wrapper components.** If a component's only purpose is to render a single child component and pass props through, it must not exist. Use the child directly. A wrapper is justified only if it adds layout, state, error boundaries, or context that the child doesn't own.

---

## PWA

25. **Framework-free client logic (D11).** `@cocooning/couple-client-business-logic` imports neither React, nor Next.js, nor browser APIs. The service worker (Serwist), push subscription (VAPID) and offline behaviour live in the web app and in `client-infrastructure` adapters.
