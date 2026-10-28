#!/bin/sh
# Stamps seed/index.html into options/<n>/index.html. The only differences from the seed:
# data-brand="blocks", asset paths pointing back at ../../seed/, and links to the option's override sheets.
# Earlier rounds (1-3, 2a, 2b) are kept as committed against the seed assets of their day; this stamps round 4 (light palettes on the live layout).
# seed/ is gitignored build output: run ./seed.sh first (it rebuilds the commits these options were made against).
cd "$(dirname "$0")"
for n in L1 L2 L3; do
  sed -e 's#data-brand="clean"#data-brand="blocks"#' \
      -e 's#"_astro/#"../../seed/_astro/#g' \
      -e 's#href="fonts/#href="../../seed/fonts/#g' \
      -e 's#\(<link rel="stylesheet" href="../../seed/_astro/Base[^"]*">\)#\1<link rel="stylesheet" href="palette.css">#' \
      seed/index.html > "options/$n/index.html"
done
