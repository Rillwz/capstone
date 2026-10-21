## Project context

Read [`compact.md`](./compact.md) whenever a task needs clarity about this project — how
the motion kit, the Astro Actions, the router and the database fit together, the house
conventions, and the gotchas. It is the handover document for this repo; keep it current
when a decision changes.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Icons

Use [Lucide](https://lucide.dev/icons) via `@lucide/astro`. Do not paste raw `<svg>` markup and do not use emoji as UI icons.

```astro
---
import { UserPlus } from "@lucide/astro";
---

<UserPlus class="size-4" />
```

- Pick the icon that matches the meaning of the label or value it sits next to — browse https://lucide.dev/icons before inventing a symbol.
- Size with Tailwind utilities, not the `size` prop: `size-4` inline with buttons and text, `size-5` for standalone/stat icons, `size-8` for large empty states.
- Colour comes from `currentColor`; set it with `text-*` on the icon or let it inherit from the parent.
- Icons are decorative by default (the package adds `aria-hidden="true"`). An icon-only button must carry an `aria-label`, and a `title` when the icon is not self-evident.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
