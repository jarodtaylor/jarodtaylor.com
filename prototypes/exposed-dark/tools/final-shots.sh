#!/bin/sh
# Saves the brief's screenshots into the prototype folder. Full-page shots use a viewport as tall as the document,
# so the fixed backstage covers the whole capture the way it covers every scroll position in a real browser.
DIR=$(cd "$(dirname "$0")/.." && pwd)
URL=${1:-http://localhost:8714/}
export AGENT_BROWSER_SESSION=exposed-dark
shot() { # width height file [full]
  agent-browser set viewport "$1" "$2" >/dev/null
  agent-browser open "$URL" >/dev/null
  agent-browser eval "try{localStorage.removeItem('palette')}catch(e){}; document.querySelector('[data-set-palette=${PAL:-b}]').click()" >/dev/null
  agent-browser wait 1200 >/dev/null
  if [ -n "$4" ]; then
    h=$(agent-browser eval "document.documentElement.scrollHeight")
    agent-browser set viewport "$1" "$h" >/dev/null
    agent-browser wait 800 >/dev/null
  fi
  agent-browser screenshot "$DIR/$3" >/dev/null && echo "saved $3"
}
shot 390 844 shot-390.png full
shot 1440 900 shot-1440.png
shot 1440 900 shot-1440-full.png full
shot 1920 1080 shot-1920.png
shot 2560 1440 shot-2560.png
for p in a b c; do PAL=$p shot 1440 900 palette-$p.png; done
