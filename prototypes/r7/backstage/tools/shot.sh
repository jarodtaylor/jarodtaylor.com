#!/bin/sh
# shot.sh <option> <width> <height> <out.png> [peek]: loads an option with the intro skipped and captures it.
S="agent-browser --session r7-backstage"
$S set viewport "$2" "$3" >/dev/null
$S open "http://localhost:8710/r7/backstage/options/$1/?brand=backstage" >/dev/null
$S eval "sessionStorage.setItem('jt-intro','1')" >/dev/null
$S reload >/dev/null
sleep 1.5
if [ "$5" = "peek" ]; then
  $S eval "document.querySelector('[data-peek-toggle]').click()" >/dev/null
  sleep 6
fi
$S screenshot "$4" >/dev/null && echo "$4"
