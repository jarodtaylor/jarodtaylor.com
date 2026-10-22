#!/bin/sh
# Round 4 screenshots, settled state unless noted. Usage: tools/shots.sh [out-dir] [base-url]
# The build plays once per session, so each settled shot marks it seen first; intro frames are seeked, not timed.
DIR=${1:-$(cd "$(dirname "$0")/.." && pwd)}
URL=${2:-http://localhost:8710/round4/}
export AGENT_BROWSER_SESSION=r4
ab() { agent-browser "$@" >/dev/null; }

settled() { # width height bg file [peek]
  ab set viewport "$1" "$2"
  ab open "${URL}?bg=$3"
  ab eval "sessionStorage.setItem('jt-intro','1')"
  ab open "${URL}?bg=$3"
  ab wait 1500
  if [ "$5" = peek ]; then
    ab click '[data-peek-toggle]'
    ab wait 2600
  fi
  agent-browser screenshot "$DIR/$4" >/dev/null && echo "saved $4"
}

intro() { # ms file
  ab set viewport 1440 900
  ab open "${URL}?bg=a&intro"
  ab wait 900
  # Freeze every running animation at the same moment of the build.
  ab eval "document.getAnimations().forEach(a => { a.pause(); a.currentTime = $1 })"
  agent-browser screenshot "$DIR/$2" >/dev/null && echo "saved $2 at ${1}ms"
}

settled 390 844 a bg-a-390.png
settled 1440 900 a bg-a-1440.png
settled 1920 1080 a bg-a-1920.png
settled 2560 1440 a bg-a-2560.png
settled 1440 900 b bg-b-1440.png
settled 2560 1440 b bg-b-2560.png
settled 1440 900 c bg-c-1440.png
settled 2560 1440 c bg-c-2560.png
settled 2560 1440 a peek-2560.png peek
intro 350 intro-1.png
intro 700 intro-2.png
intro 1150 intro-3.png
