#!/bin/sh
# Rebuild seed/ (gitignored). Rounds 1-3 were made against the site at d25c937, the light palettes (L1-L3)
# against 841723d; both builds share seed/ (their asset names differ).
exec "$(dirname "$0")/../build-seed.sh" "$(dirname "$0")" d25c937 841723d
