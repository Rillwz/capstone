#!/usr/bin/env bash
# Renders every .mmd in this directory with Ondine's image worker.
# The payload form (zlib deflate + base64url) keeps the URL under the 4,096-character limit.
set -euo pipefail
cd "$(dirname "$0")"

for file in *.mmd; do
  base="${file%.mmd}"
  payload=$(node -e "const z=require('zlib'),fs=require('fs');process.stdout.write(z.deflateSync(fs.readFileSync(process.argv[1],'utf8')).toString('base64url'))" "$file")

  curl -fsS "https://ondine.sh/${payload}.svg" -o "${base}.svg"
  curl -fsS "https://ondine.sh/${payload}.svg?scheme=dark" -o "${base}.dark.svg"
  curl -fsS "https://ondine.sh/${payload}.png" -o "${base}.png"

  if grep -q "could not render" "${base}.svg"; then
    echo "${base}: RENDER ERROR" >&2
    exit 1
  fi
  echo "${base}: ok"
done
