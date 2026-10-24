#!/bin/sh
# Round 5 screenshots. Usage: tools/shots.sh [out-dir] [base-url]
# Resting shots mark the intro seen first. Intro frames freeze every transition at one moment of the
# choreography (they are all created when the layer turns on), so the frames are exact, not timed.
DIR=${1:-$(cd "$(dirname "$0")/.." && pwd)}
URL=${2:-http://localhost:8710/round5/}
export AGENT_BROWSER_SESSION=r5
ab() { agent-browser "$@" >/dev/null; }

rest() { # width height rest file [peek]
  ab set viewport "$1" "$2"
  ab open "${URL}?rest=$3"
  ab eval "sessionStorage.setItem('jt-intro','1')"
  ab open "${URL}?rest=$3&r=$(date +%s)"
  ab wait 900
  if [ "$5" = peek ]; then
    ab click '[data-peek-toggle]'
    ab wait 2400
  fi
  agent-browser screenshot "$DIR/$4" >/dev/null && echo "saved $4"
}

intro() { # width height ms file
  ab set viewport "$1" "$2"
  ab open "${URL}?rest=line&intro&r=$(date +%s)"
  ab wait --fn "document.documentElement.dataset.peekState === 'on'"
  ab eval "document.getAnimations().forEach(a => { a.pause(); a.currentTime = $3 })"
  agent-browser screenshot "$DIR/$4" >/dev/null && echo "saved $4 at ${3}ms"
}

rest 390 844 line rest-line-390.png
rest 1440 900 line rest-line-1440.png
rest 2560 1440 line rest-line-2560.png
rest 390 844 fill rest-fill-390.png
rest 1440 900 fill rest-fill-1440.png
rest 2560 1440 fill rest-fill-2560.png
rest 2560 1440 line peek-2560.png peek
for w in 1440 2560; do
  h=900; [ $w = 2560 ] && h=1440
  intro $w $h 300 intro-1-$w.png
  intro $w $h 750 intro-2-$w.png
  intro $w $h 1200 intro-3-$w.png
  intro $w $h 1900 intro-4-$w.png
done
