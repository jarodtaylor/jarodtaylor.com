#!/bin/sh
# Usage: tools/shots.sh <outdir> [url]. Captures first viewport at each width plus layout metrics.
OUT=${1:-.}; URL=${2:-http://localhost:8714/}
export AGENT_BROWSER_SESSION=exposed-dark
for size in "390 844" "1440 900" "1920 1080" "2560 1440"; do
  set -- $size
  agent-browser set viewport $1 $2 >/dev/null
  agent-browser open "$URL" >/dev/null
  agent-browser wait 1200 >/dev/null
  agent-browser screenshot "$OUT/view-$1.png" >/dev/null
  echo "$1: $(agent-browser eval 'JSON.stringify({statsTop: Math.round(document.querySelector(".stats").getBoundingClientRect().top), statsBottom: Math.round(document.querySelector(".stats").getBoundingClientRect().bottom), scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth, name: getComputedStyle(document.querySelector(".name")).fontSize, nameRight: Math.round(document.querySelector(".name span:last-child").getBoundingClientRect().right)})')"
done
