#!/bin/sh
# Stamps seed/index.html into options/<n>/index.html. The only differences from the seed:
# data-brand="blocks", asset paths pointing back at ../../seed/, and one extra <link> to the option's override sheet.
cd "$(dirname "$0")"
for n in 1 2 3; do
  sed -e 's#data-brand="clean"#data-brand="blocks"#' \
      -e 's#"_astro/#"../../seed/_astro/#g' \
      -e 's#href="fonts/#href="../../seed/fonts/#g' \
      -e 's#\(<link rel="stylesheet" href="../../seed/_astro/Base[^"]*">\)#\1<link rel="stylesheet" href="blocks.css">#' \
      seed/index.html > "options/$n/index.html"
done
