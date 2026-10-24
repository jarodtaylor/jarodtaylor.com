#!/bin/sh
# r6 Backstage screenshots. Usage: tools/shots.sh [out-dir] [base-url]
# Resting shots mark the intro seen first. Intro frames freeze every transition at one moment of the
# choreography (they are all created when the layer turns on), so the frames are exact, not timed.
DIR=${1:-$(cd "$(dirname "$0")/.." && pwd)}
URL=${2:-http://localhost:8710/r6-backstage/}
export AGENT_BROWSER_SESSION=r6b
ab() { agent-browser "$@" >/dev/null; }

rest() { # width height file
  ab set viewport "$1" "$2"
  ab open "$URL"
  ab eval "sessionStorage.setItem('jt-intro','1')"
  ab open "${URL}?r=$(date +%s)"
  ab wait 1200
  agent-browser screenshot "$DIR/$3" >/dev/null && echo "saved $3"
  agent-browser eval "JSON.stringify({w: innerWidth, sw: document.documentElement.scrollWidth, h: innerHeight, sh: document.documentElement.scrollHeight})"
}

intro() { # width height ms file
  ab set viewport "$1" "$2"
  ab open "${URL}?intro&r=$(date +%s)"
  ab wait --fn "document.documentElement.dataset.peekState === 'on'"
  ab eval "document.getAnimations().forEach(a => { a.pause(); a.currentTime = $3 })"
  agent-browser screenshot "$DIR/$4" >/dev/null && echo "saved $4 at ${3}ms"
}

rest 390 844 shot-390.png
rest 1440 900 shot-1440.png
rest 2560 1440 shot-2560.png
intro 1440 900 750 intro-1.png
intro 1440 900 1650 intro-2.png
