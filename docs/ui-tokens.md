# UI Tokens

Design tokens for the frontend. This is a living doc — update it only when a new token is
actually needed, not preemptively. Source of truth for values is shadcn/ui's default Tailwind CSS
theme (Zinc base), used as-is unless noted otherwise below.

## Foundation

- **Component library:** [shadcn/ui](https://ui.shadcn.com/) (Radix primitives + Tailwind CSS,
  copied into the repo, not an npm dependency to fork/theme).
- **Base color:** `zinc` (shadcn default) — neutral, works for a document-editing tool without
  needing a custom brand palette for a 2-hour build.
- **Icons:** `lucide-react` (shadcn's default icon set).
- **Font:** system font stack (shadcn default) — no custom webfont loading for this pass.

## Color (semantic, via shadcn CSS variables)

| Token                      | Use                                                                  |
| -------------------------- | -------------------------------------------------------------------- |
| `background`/`foreground`  | Page background / default text                                       |
| `primary`                  | Primary actions (New document, Save, Grant access)                   |
| `muted`/`muted-foreground` | Secondary text, timestamps, empty states                             |
| `destructive`              | Reserved (no destructive actions in this pass — no delete/revoke UI) |
| `border`                   | Card/list dividers, input borders                                    |

## Spacing & radius

- Use Tailwind's default spacing scale (`4px` base unit) — no custom scale.
- Use shadcn default `radius` variable (`0.5rem`) for cards, inputs, buttons.

## Typography

- Use Tailwind's default type scale (`text-sm`, `text-base`, `text-lg`, `text-xl`) — no custom
  scale. Document titles: `text-xl font-semibold`. Body/editor text: `text-base`.

## Status badges (owned vs. shared distinction, ADR-0002/0005)

- "Owned" — `Badge` variant `secondary`.
- "Shared" — `Badge` variant `outline`.
- No new colors introduced for this — reuse existing badge variants rather than inventing a
  bespoke token.

## Change log

- Initial tokens defined alongside shadcn/ui adoption (2026-09-22). No customizations yet beyond
  shadcn defaults.
