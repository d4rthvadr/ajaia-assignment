# UI Tokens

Design tokens for the frontend. This is a living doc — update it only when a new product need
appears. The visual direction is a lightweight Docs-style writing workspace: familiar, bright,
quiet, and optimized for scanning documents.

## Foundation

- **Component library:** [shadcn/ui](https://ui.shadcn.com/) (Radix primitives + Tailwind CSS,
  copied into the repo, not an npm dependency to fork/theme).
- **Base color:** warm neutral white and cool gray surfaces, with Docs-inspired blue for identity
  and primary actions.
- **Icons:** `lucide-react` (shadcn's default icon set).
- **Font:** `"Google Sans", Arial, sans-serif` for UI; Georgia is reserved for the writing canvas.

## Color (semantic, via shadcn CSS variables)

| Token                | Value     | Use                             |
| -------------------- | --------- | ------------------------------- |
| `--surface`          | `#ffffff` | App bar, cards, editor paper    |
| `--workspace`        | `#f8f9fa` | Documents and editor background |
| `--foreground`       | `#202124` | Primary text                    |
| `--muted-foreground` | `#5f6368` | Labels, timestamps, helper text |
| `--brand`            | `#1a73e8` | Logo, links, primary action     |
| `--brand-soft`       | `#e8f0fe` | Selected and hover states       |
| `--border`           | `#dadce0` | Dividers, inputs, paper edge    |
| `--danger`           | `#d93025` | Validation and action errors    |

## Spacing & radius

- Use a 4px base spacing scale. Primary page gutters are 24px desktop and 16px mobile.
- App bar height is 64px. Document rows are at least 56px. Editor paper has 64px desktop padding
  and 24px mobile padding.
- Use 8px radius for inputs and buttons; use 4px radius for rows and paper edges.

## Typography

- UI body text is 14px-16px with a 1.4 line height. Labels and metadata are 12px-13px.
- Workspace headings are 28px-36px at weight 400-500. Document titles are 16px at weight 500.
- Editor content is 16px-18px with a 1.6-1.75 line height. Keep normal letter spacing at 0.

## Status badges (owned vs. shared distinction, ADR-0002/0005)

- "Owned" — `Badge` variant `secondary`.
- "Shared" — `Badge` variant `outline`.
- No new colors introduced for this — reuse existing badge variants rather than inventing a
  bespoke token.

## Brand Direction

- The product should feel like a dependable writing utility, not a dashboard or landing page.
- Use blue sparingly for identity, links, focus, and primary actions.
- Keep surfaces mostly white and gray so document content remains the visual priority.
- Avoid gradients, decorative blobs, glass effects, and animated decoration.

## Change log

- Initial tokens defined alongside shadcn/ui adoption (2026-09-22). No customizations yet beyond
  shadcn defaults.
- Docs-style brand tokens and shared primitive adoption recorded (2026-09-22).
