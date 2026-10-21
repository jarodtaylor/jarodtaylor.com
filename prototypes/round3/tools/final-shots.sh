#!/bin/sh
# Saves the round 3 brief's screenshots into the prototype folder.
# Usage: tools/final-shots.sh [url]. Full-page shots use the browser's native full-page capture, so the
# 100svh hero keeps its real viewport height instead of inflating to the document height. The fixed backstage
# is pinned to the document height first, so it covers the whole capture the way it covers every scroll position.
DIR=$(cd "$(dirname "$0")/.." && pwd)
URL=${1:-http://localhost:8710/round3/}
export AGENT_BROWSER_SESSION=round3
shot() { # width height file [full|peek]
  agent-browser set viewport "$1" "$2" >/dev/null
  agent-browser open "$URL" >/dev/null
  agent-browser wait 1400 >/dev/null
  if [ "$4" = peek ]; then
    agent-browser click '[data-peek-toggle]' >/dev/null
    agent-browser wait 3000 >/dev/null
  fi
  if [ "$4" = full ]; then
    agent-browser eval "const b = document.querySelector('.backstage'); b.style.position = 'absolute'; b.style.height = document.documentElement.scrollHeight + 'px'" >/dev/null
    agent-browser screenshot --full "$DIR/$3" >/dev/null && echo "saved $3"
  else
    agent-browser screenshot "$DIR/$3" >/dev/null && echo "saved $3"
  fi
}
shot 390 844 shot-390.png full
shot 1440 900 shot-1440.png
shot 1440 900 shot-1440-full.png full
shot 1920 1080 shot-1920.png
shot 2560 1440 shot-2560.png
shot 2560 1440 shot-2560-full.png full
shot 1440 900 peek-1440.png peek
shot 2560 1440 peek-2560.png peek
