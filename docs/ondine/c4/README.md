# Ondine — C4 model diagrams

Seven C4 views of the Ondine application, drawn in Mermaid's C4 dialect and rendered by Ondine
itself (the image worker at `ondine.sh`). Each view is a separate file, because a C4 model is
read one level at a time.

Regenerate every image with `./render.sh`. It renders each `.mmd` to a light SVG, a dark SVG, and a
1200×630 PNG card, and fails if a diagram does not compile.

| # | View | Source | Light | Dark |
| --- | --- | --- | --- | --- |
| 1 | System Context | `01-context.mmd` | [svg](01-context.svg) | [svg](01-context.dark.svg) |
| 2 | Container | `02-container.mmd` | [svg](02-container.svg) | [svg](02-container.dark.svg) |
| 3 | Component — Image Worker | `03-component-worker.mmd` | [svg](03-component-worker.svg) | [svg](03-component-worker.dark.svg) |
| 4 | Component — Compiler Core | `04-component-compiler.mmd` | [svg](04-component-compiler.svg) | [svg](04-component-compiler.dark.svg) |
| 5 | Deployment | `05-deployment.mmd` | [svg](05-deployment.svg) | [svg](05-deployment.dark.svg) |
| 6 | Dynamic — compile at build time | `06-dynamic-build.mmd` | [svg](06-dynamic-build.svg) | [svg](06-dynamic-build.dark.svg) |
| 7 | Dynamic — serve a diagram as an image | `07-dynamic-worker.mmd` | [svg](07-dynamic-worker.svg) | [svg](07-dynamic-worker.dark.svg) |

## Sources

Every fact comes from the Ondine documentation and the `wevm/ondine` repository:

- `crates/compiler/src/` — the Rust compiler: `preprocess.rs`, `detect.rs`, `model.rs`, `layout/`,
  `svg/`, `text/`, `diagrams/<type>/`, `error.rs`
- `crates/wasm/src/lib.rs` — the WebAssembly binding
- `src/` — the TypeScript package: `compiler/`, `cli/`, `vite/`, `remark/`, `Mount.ts`, `Render.ts`
- `site/` — the documentation site and the image Worker (`site/src/Image.ts`, `site/wrangler.jsonc`)

## Notes on the drawings

- The compiler core is one container: the Vite plugin, the Remark plugin, the CLI, and both
  compiler APIs all call the same Rust code through WebAssembly.
- The mount runtime is a separate container because it is the only part that ships to the browser,
  and it imports nothing from the compiler.
- The image Worker and the documentation site are one deployment (one Worker, one custom domain),
  shown as two containers here and as two deployment nodes in the deployment view.
