#!/usr/bin/env bash
# Renders the class-model sources in this directory with Ondine's image worker.
# The payload form (zlib deflate + base64url) keeps the URL under the 4,096-character limit.
set -euo pipefail
cd "$(dirname "$0")"

# The worker emits an SVG with no background, so it renders transparent everywhere
# (viewers, Word, GitHub). Paint one behind the diagram, using the scheme's own
# --ondine-bg: white for the light file, black for the dark one.
opaque() {
  node -e '
    const fs = require("fs");
    const file = process.argv[1];
    const svg = fs.readFileSync(file, "utf8");
    if (svg.includes("data-background")) process.exit(0);
    const [, w, h] = /viewBox="0 0 (\d+) (\d+)"/.exec(svg);
    const rect = `<rect data-background width="${w}" height="${h}" fill="var(--_bg)"/>`;
    fs.writeFileSync(file, svg.replace("</style>", `</style>${rect}`));
  ' "$1"
}

for file in class-*.mmd; do
  base="${file%.mmd}"
  payload=$(node -e "const z=require('zlib'),fs=require('fs');process.stdout.write(z.deflateSync(fs.readFileSync(process.argv[1],'utf8')).toString('base64url'))" "$file")

  curl -fsS "https://ondine.sh/${payload}.svg" -o "${base}.svg"
  curl -fsS "https://ondine.sh/${payload}.svg?scheme=dark" -o "${base}.dark.svg"
  curl -fsS "https://ondine.sh/${payload}.png" -o "${base}.png"

  opaque "${base}.svg"
  opaque "${base}.dark.svg"

  if grep -q "could not render" "${base}.svg"; then
    echo "${base}: RENDER ERROR" >&2
    exit 1
  fi
  echo "${base}: ok"
done
