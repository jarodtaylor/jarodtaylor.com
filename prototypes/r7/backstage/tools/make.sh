#!/bin/sh
# Builds options/<n>/index.html from seed/index.html: the live markup, byte for byte in <body>, with
# data-brand="backstage", asset paths pointed at ../../seed/, and the option's override CSS (and JS, if any) linked
# last in <head>. Rerun after ./seed.sh (seed/ is build output); never hand-edit the option HTML. Seed links may be
# written _astro/… (as build-seed.sh emits) or ./_astro/… (older seeds); both are repointed.
cd "$(dirname "$0")/.."
for dir in options/*/; do
  n=$(basename "$dir")
  extra=""
  [ -f "$dir/option.css" ] && extra="$extra<link rel=\"stylesheet\" href=\"option.css\">"
  [ -f "$dir/option.js" ] && extra="$extra<script src=\"option.js\" defer></script>"
  sed -e 's#data-brand="clean"#data-brand="backstage"#' \
      -e 's#"\(\./\)\{0,1\}_astro/#"../../seed/_astro/#g' \
      -e 's#"\(\./\)\{0,1\}fonts/#"../../seed/fonts/#g' \
      -e "s#</head>#$extra</head>#" seed/index.html > "$dir/index.html"
  echo "built option $n"
done
