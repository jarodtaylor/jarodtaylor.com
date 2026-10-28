#!/bin/sh
# Usage: shoot.sh <name> <path-under-roleline>   e.g. shoot.sh 1 options/1/
# Writes shots/<name>-<brand>-<width>.png (first viewport) for every brand at 390 and 1440.
set -e
S="agent-browser --session r7-roleline"
DIR="$(cd "$(dirname "$0")" && pwd)"
for w in 390 1440; do
  if [ "$w" = 390 ]; then h=844; else h=900; fi
  $S set viewport $w $h >/dev/null
  for b in clean backstage blocks; do
    $S open "http://localhost:8710/r7/roleline/$2?brand=$b" >/dev/null
    # skip the once-per-tab intro so the shot is the resting state
    $S eval "sessionStorage.setItem('jt-intro','1')" >/dev/null
    $S open "http://localhost:8710/r7/roleline/$2?brand=$b" >/dev/null
    $S wait 900 >/dev/null
    $S screenshot "$DIR/shots/$1-$b-$w.png" >/dev/null
  done
done
echo done "$1"
