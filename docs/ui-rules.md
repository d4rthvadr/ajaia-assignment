# UI Rules

Conventions for the Docs-style writing workspace. This is a living doc; add a rule only when a
new product pattern actually appears.

## Core rule

Use the copied shadcn-style primitives in `frontend/src/components/ui/button.tsx` for buttons,
inputs, labels, and badges. Keep the visual language close to a familiar document editor:
compact controls, clear labels, white surfaces, and content-first spacing.

## Component mapping (add rows here as new UI needs arise)

| Need                                                 | Component                                                                                                         |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Buttons (New document, Save, Share, Import)          | `Button`                                                                                                          |
| Text inputs (email, password, title, share-by-email) | `TextInput` + `FieldLabel`                                                                                        |
| Sign up / log in forms                               | `Form` (react-hook-form + zod, shadcn pattern)                                                                    |
| "My documents" / "Shared with me" lists              | `Card` per document row, or `Table` if the list grows                                                             |
| Owned vs. shared distinction                         | `StatusBadge` (see [ui-tokens.md](ui-tokens.md))                                                                  |
| Grant-access dialog                                  | `Dialog`                                                                                                          |
| Attachment list                                      | `Card` or plain list with `Button` (variant `ghost`) for download                                                 |
| Errors (bad login, rejected file type, no such user) | `Alert` (inline) or `Sonner` (toast) — prefer inline `Alert` for form errors, toast for transient action feedback |
| Loading states                                       | `Skeleton` for lists, disabled `Button` with spinner for in-flight actions                                        |

## Layout

- Use a full-width pale workspace with a compact white app bar.
- Keep the document list in a centered 960px-1200px content region; use a 700px reading column for
  the editor.
- The editor is a white paper surface inside the workspace. Keep toolbar and metadata outside the
  writing area so content stays calm and legible.
- Responsive behavior is limited to stacking columns and reducing gutters; controls must remain
  usable at narrow widths.
- Do not create decorative hero sections, nested cards, or a permanent dashboard sidebar.

## Forms

- Use `react-hook-form` + `zod` resolver (shadcn's documented pattern) for signup/login and the
  share-by-email form — consistent client-side validation before hitting the API.
- Server error responses (400/403/404 per [docs/specs/api.md](specs/api.md)) surface as an inline
  `Alert`, not a silent console log.

## Typography And Color

- Use `"Google Sans", Arial, sans-serif` for interface text and Georgia only for the editor canvas.
- Use `#202124` for primary text, `#5f6368` for supporting text, and `#1a73e8` for brand actions.
- Reserve red for errors. Do not use green as the primary brand color without updating the token
  contract.
- Headings should be sentence case and concise. Avoid promotional copy in workspace screens.

## Interaction

- Every icon-only button needs an accessible label and a tooltip/title for unfamiliar actions.
- Keep primary actions text-plus-icon when the action is not universally recognizable.
- Use blue focus rings and visible hover states; never remove browser focus indication.
- Loading, empty, error, owner, and viewer states should occupy the same layout region.

## Accessibility baseline

- Every interactive control has a visible label (via `FieldLabel`, not placeholder-only).
- Rely on Radix's built-in focus management/ARIA (shadcn components inherit this) rather than
  adding custom handling.

## Explicit non-goals

- No dark mode toggle, no custom font download, no animation library, and no decorative motion in
  this timeboxed pass.

## Change log

- Initial rules defined alongside shadcn/ui adoption (2026-09-22).
- Docs-style layout, brand, typography, and color direction extracted from the supplied reference
  screens (2026-09-22).
