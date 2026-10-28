#!/bin/sh
# Builds options/<n>/index.html from seed/index.html: the live markup, byte for byte in <body>, with
# data-brand="backstage", asset paths pointed at ../../seed/, and the option's override CSS (and JS, if any) linked
# last in <head>. Rerun after editing the seed; never hand-edit the option HTML.
cd "$(dirname "$0")/.."
for dir in options/*/; do
  n=$(basename "$dir")
  extra=""
  [ -f "$dir/option.css" ] && extra="$extra<link rel=\"stylesheet\" href=\"option.css\">"
  [ -f "$dir/option.js" ] && extra="$extra<script src=\"option.js\" defer></script>"
  sed -e 's#data-brand="clean"#data-brand="backstage"#' \
      -e 's#"\./_astro/#"../../seed/_astro/#g' \
      -e 's#"\./fonts/#"../../seed/fonts/#g' \
      -e "s#</head>#$extra</head>#" seed/index.html > "$dir/index.html"
  echo "built option $n"
done
