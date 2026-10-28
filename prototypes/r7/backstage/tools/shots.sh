#!/bin/sh
# Captures every option at 390 and 1440 into shots/. Option 2 waits for the plotter to move; option 3 shows guides.
cd "$(dirname "$0")/.."
S="agent-browser --session r7-backstage"
for n in 0 1 2 3; do
  for vp in "390 844" "1440 900"; do
    set -- $vp
    tools/shot.sh $n $1 $2 shots/option-$n-$1.png >/dev/null
    if [ $n = 2 ]; then sleep 5; fi
    if [ $n = 3 ] && [ $1 = 1440 ]; then $S mouse move 1000 400 >/dev/null; $S mouse move 1012 470 >/dev/null; sleep 0.6; fi
    $S screenshot shots/option-$n-$1.png >/dev/null && echo shots/option-$n-$1.png
  done
done
