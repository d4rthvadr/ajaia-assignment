# UI Rules

Conventions for building the frontend with shadcn/ui. This is a living doc — update it only when
a new pattern is actually needed, not preemptively.

## Core rule

Use a shadcn/ui component if one exists for the job. Only build a custom component when no
shadcn primitive fits — don't recreate what the library already provides.

## Component mapping (add rows here as new UI needs arise)

| Need                                                 | Component                                                                                                         |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Buttons (New document, Save, Share, Import)          | `Button`                                                                                                          |
| Text inputs (email, password, title, share-by-email) | `Input` + `Label`                                                                                                 |
| Sign up / log in forms                               | `Form` (react-hook-form + zod, shadcn pattern)                                                                    |
| "My documents" / "Shared with me" lists              | `Card` per document row, or `Table` if the list grows                                                             |
| Owned vs. shared distinction                         | `Badge` (see [ui-tokens.md](ui-tokens.md))                                                                        |
| Grant-access dialog                                  | `Dialog`                                                                                                          |
| Attachment list                                      | `Card` or plain list with `Button` (variant `ghost`) for download                                                 |
| Errors (bad login, rejected file type, no such user) | `Alert` (inline) or `Sonner` (toast) — prefer inline `Alert` for form errors, toast for transient action feedback |
| Loading states                                       | `Skeleton` for lists, disabled `Button` with spinner for in-flight actions                                        |

## Layout

- Page shell: simple centered container (`max-w-2xl` for editor/forms, `max-w-4xl` for document
  lists) — no sidebar/nav chrome beyond what's needed (this is not a full workspace app, per
  ADR-0005).
- No responsive/mobile-specific design pass in this build — desktop-width layout is sufficient
  for the timebox; components should just not visibly break on a narrower viewport.

## Forms

- Use `react-hook-form` + `zod` resolver (shadcn's documented pattern) for signup/login and the
  share-by-email form — consistent client-side validation before hitting the API.
- Server error responses (400/403/404 per [docs/specs/api.md](specs/api.md)) surface as an inline
  `Alert`, not a silent console log.

## Accessibility baseline

- Every interactive control has a visible label (via shadcn `Label`, not placeholder-only).
- Rely on Radix's built-in focus management/ARIA (shadcn components inherit this) rather than
  adding custom handling.

## Explicit non-goals

- No dark mode toggle, no theming beyond the default shadcn Zinc theme, no animation library
  beyond what shadcn components already include.

## Change log

- Initial rules defined alongside shadcn/ui adoption (2026-09-22).
