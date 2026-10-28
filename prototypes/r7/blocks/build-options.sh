#!/bin/sh
# Stamps seed/index.html into options/<n>/index.html. The only differences from the seed:
# data-brand="blocks", asset paths pointing back at ../../seed/, and links to the option's override sheets.
# Round 1 (options 1-3) was stamped from the pre-roles seed and is kept as committed; this stamps round 2.
# The seed now carries the site-wide roles list (<ul class="roles">, copied from r7/roleline/options/2).
cd "$(dirname "$0")"
for n in 2a 2b; do
  sed -e 's#data-brand="clean"#data-brand="blocks"#' \
      -e 's#"_astro/#"../../seed/_astro/#g' \
      -e 's#href="fonts/#href="../../seed/fonts/#g' \
      -e 's#\(<link rel="stylesheet" href="../../seed/_astro/Base[^"]*">\)#\1<link rel="stylesheet" href="../2-light/baseplate.css"><link rel="stylesheet" href="palette.css">#' \
      seed/index.html > "options/$n/index.html"
done
