#!/bin/sh
# Rebuild an r7 folder's seed/ (gitignored build output) from the commits its options were made against.
# Usage: build-seed.sh <folder> <rev> [<rev> ...]   (later revs overlay earlier ones)
# Builds are reproducible (asset names are content hashes), so each rev's build has exactly the file names the
# options link to. Each rev is built in a throwaway git worktree; your working tree is never touched.
set -e
here=$(cd "$1" && pwd)
shift
root=$(git -C "$(dirname "$0")" rev-parse --show-toplevel)
mkdir -p "$here/seed"
for rev in "$@"; do
  tmp=$(mktemp -d)
  git -C "$root" worktree add --detach --quiet "$tmp/src" "$rev"
  (cd "$tmp/src" && pnpm install --frozen-lockfile --prefer-offline --silent && pnpm build --silent)
  cp -R "$tmp/src/dist/." "$here/seed/"
  git -C "$root" worktree remove --force "$tmp/src"
  echo "seed: $(basename "$here") <- $rev"
done
# The site links from its root (/_astro/, /fonts/); the seed is served from a subfolder, so make those links relative.
find "$here/seed" -maxdepth 1 -name '*.html' -exec sed -i.bak -e 's#="/_astro/#="_astro/#g' -e 's#="/fonts/#="fonts/#g' {} +
find "$here/seed/_astro" -name '*.css' -exec sed -i.bak -e 's#url("/fonts/#url("../fonts/#g' {} +
find "$here/seed" -name '*.bak' -delete
